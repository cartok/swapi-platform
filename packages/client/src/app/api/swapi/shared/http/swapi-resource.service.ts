import { httpResource } from '@angular/common/http'
import {
  computed,
  type ResourceStatus,
  runInInjectionContext,
  type Signal,
  untracked,
} from '@angular/core'

import {
  MINIMAL_HTTP_RETRY_POLICY,
  retryableHttpResourceRequest,
} from '@/api/swapi/shared/http/http-retry.interceptor'
import type {
  SwapiResourceCollectionDto,
  SwapiResourceDto,
} from '@/api/swapi/shared/types/dto'
import type {
  SwapiResource,
  SwapiResourceCollection,
} from '@/api/swapi/shared/types/model'
import {
  type SwapiResourceServiceConfig,
  type SwapiResourceServiceMethodOptions,
  type SwapiServiceResult,
} from '@/api/swapi/shared/types/service'
import { extractSwapiIdOptional } from '@/api/swapi/shared/utils/mapping'

export class SwapiResourceService<
  TDto extends SwapiResourceDto,
  TModel extends SwapiResource,
> {
  private static readonly swapiApiBaseUrl = 'https://swapi.dev/api'

  private readonly defaultItemCacheTtlMs = 5 * 60 * 1000
  private readonly itemCache = new Map<string, SwapiResourceItemCacheEntry<TModel>>()

  constructor(private readonly config: SwapiResourceServiceConfig<TDto, TModel>) {}

  getCollection(
    page: Signal<string>,
    options?: SwapiResourceServiceMethodOptions,
  ): SwapiServiceResult<SwapiResourceCollection<TModel>> {
    const resource = runInInjectionContext(this.config.injector, () =>
      httpResource<SwapiResourceCollectionDto<TDto>>(
        retryableHttpResourceRequest(
          () =>
            SwapiResourceService.swapiUrl([this.config.resourcePath], { page: page() }),
          options?.retryPolicy,
        ),
      ),
    )

    const data = computed<SwapiResourceCollection<TModel>>(() => {
      if (!resource.hasValue()) {
        return { items: [] }
      }

      const response = resource.value()
      const items: TModel[] = []

      for (const dto of response.results ?? []) {
        try {
          const item = this.config.mapDtoToModel(dto)
          items.push(item)
          this.setCacheEntry(item.id, { item })
        } catch {
          // Skip invalid items in collection responses.
        }
      }

      return {
        count: response.count,
        next: extractSwapiIdOptional(response.next),
        previous: extractSwapiIdOptional(response.previous),
        items,
      }
    })

    return {
      data,
      status: resource.status,
      errors: computed<Error[] | undefined>(() => {
        const currentError = resource.error()
        if (currentError === undefined) {
          return undefined
        }

        return [currentError]
      }),
      reload: () => resource.reload(),
    }
  }

  getItem(
    id: Signal<string>,
    options?: SwapiResourceServiceMethodOptions,
  ): SwapiServiceResult<TModel | undefined> {
    const resource = runInInjectionContext(this.config.injector, () =>
      httpResource<TModel>(
        retryableHttpResourceRequest(
          () => SwapiResourceService.swapiUrl([this.config.resourcePath, id()]),
          options?.retryPolicy,
        ),
        {
          parse: (value: unknown): TModel => this.config.mapDtoToModel(value as TDto),
        },
      ),
    )

    const data = computed<TModel | undefined>(() => {
      const item = resource.value()
      if (item !== undefined) {
        this.setCacheEntry(item.id, { item })

        return item
      }

      return this.getCachedItem(id())
    })

    return {
      data,
      status: resource.status,
      errors: computed<Error[] | undefined>(() => {
        const currentError = resource.error()
        if (currentError === undefined) {
          return undefined
        }

        return [currentError]
      }),
      reload: () => resource.reload(),
    }
  }

  getItems(
    ids: Signal<string[]>,
    options?: SwapiResourceServiceMethodOptions,
  ): SwapiServiceResult<TModel[]> {
    const getOrCreateResource = (id: string): SwapiServiceResult<TModel | undefined> => {
      const currentTime = Date.now()
      const cachedEntry = this.itemCache.get(id)
      if (cachedEntry?.resource !== undefined) {
        if (cachedEntry.expiresAt > currentTime) {
          return cachedEntry.resource
        }

        cachedEntry.resource.reload()
        this.setCacheEntry(id, { resource: cachedEntry.resource })

        return cachedEntry.resource
      }

      const newResource = untracked(() =>
        this.getItem(
          computed(() => id),
          {
            ...options,
            retryPolicy:
              options?.includeMinimalRetryForItems === false
                ? options.retryPolicy
                : {
                    ...MINIMAL_HTTP_RETRY_POLICY,
                    ...options?.retryPolicy,
                  },
          },
        ),
      )
      this.setCacheEntry(id, { resource: newResource })

      return newResource
    }

    const resources = computed<SwapiServiceResult<TModel | undefined>[]>(() => {
      return ids().map((id) => getOrCreateResource(id))
    })

    const data = computed<TModel[]>(() => {
      const items: TModel[] = []
      for (const id of ids()) {
        const item = getOrCreateResource(id).data()
        if (item !== undefined) {
          items.push(item)
        }
      }

      return items
    })

    const status = computed<ResourceStatus>(() => {
      const currentResources = resources()
      if (currentResources === undefined) {
        return 'idle'
      }

      if (currentResources.length === 0) {
        return 'resolved'
      }

      let hasLoading = false
      let hasReloading = false
      for (const resource of currentResources) {
        const resourceStatus = resource.status()
        if (resourceStatus === 'error') {
          return 'error'
        }

        if (resourceStatus === 'loading') {
          hasLoading = true
        }

        if (resourceStatus === 'reloading') {
          hasReloading = true
        }
      }

      if (hasLoading) {
        return 'loading'
      }

      if (hasReloading) {
        return 'reloading'
      }

      return 'resolved'
    })

    const errors = computed<Error[] | undefined>(() => {
      const currentResources = resources()
      if (currentResources === undefined) {
        return undefined
      }

      const currentErrors: Error[] = []
      for (const resource of currentResources) {
        const itemErrors = resource.errors()
        if (itemErrors !== undefined) {
          currentErrors.push(...itemErrors)
        }
      }

      if (currentErrors.length === 0) {
        return undefined
      }

      return currentErrors
    })

    return {
      data,
      status,
      errors,
      reload: () => {
        const currentResources = resources()
        if (currentResources === undefined) {
          return false
        }

        let hasReloaded = false
        for (const id of new Set(ids())) {
          hasReloaded = getOrCreateResource(id).reload() || hasReloaded
        }

        return hasReloaded
      },
    }
  }

  private setCacheEntry(
    id: string,
    entry: Omit<SwapiResourceItemCacheEntry<TModel>, 'expiresAt'>,
  ): void {
    const currentEntry = this.itemCache.get(id)
    this.itemCache.set(id, {
      ...currentEntry,
      ...entry,
      expiresAt: Date.now() + (this.config.itemCacheTtlMs ?? this.defaultItemCacheTtlMs),
    })
  }

  private getCachedItem(id: string): TModel | undefined {
    const currentEntry = this.itemCache.get(id)
    if (currentEntry?.item === undefined) {
      return undefined
    }

    if (currentEntry.expiresAt <= Date.now()) {
      if (currentEntry.resource === undefined) {
        this.itemCache.delete(id)
      }

      return undefined
    }

    return currentEntry.item
  }

  private static swapiUrl(
    pathSegments: string[],
    query?: ConstructorParameters<typeof URLSearchParams>[0],
  ): string {
    const path = pathSegments
      .map((pathSegment) => this.normalizePathSegment(pathSegment))
      .join('/')

    const baseUrlAndPath = `${this.swapiApiBaseUrl}/${path}`

    if (query !== undefined) {
      const parameterString = new URLSearchParams(query).toString()
      if (parameterString.length === 0) {
        return new URL(baseUrlAndPath).toString()
      }

      return new URL(`${baseUrlAndPath}?${parameterString}`).toString()
    }

    return new URL(baseUrlAndPath).toString()
  }

  private static normalizePathSegment(value: string): string {
    return value.replace(/^\/+|\/+$/g, '')
  }
}

interface SwapiResourceItemCacheEntry<TModel extends SwapiResource> {
  readonly resource?: SwapiServiceResult<TModel | undefined>
  readonly item?: TModel
  readonly expiresAt: number
}
