import { httpResource } from '@angular/common/http'
import type { Injector, ResourceStatus, Signal } from '@angular/core'
import { computed, runInInjectionContext, untracked } from '@angular/core'
import { SWAPI_BASE_URL_STRING } from '@swapi/shared/apis/external/urls'

import type { SwapiItemCacheStore } from '@/api/swapi/swapi-item-cache.store'
import type { SwapiResourceCollectionDto, SwapiResourceDto } from '@/api/swapi/types/dto'
import type { SwapiResource, SwapiResourceCollection } from '@/api/swapi/types/model'
import { extractSwapiIdOptional } from '@/api/swapi/utils/mapping'
import type { RetryableHttpResourceMethodOptions } from '@/http/http-retry.interceptor'
import { retryableHttpResourceRequest } from '@/http/http-retry.interceptor'

const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 60

interface SwapiResourceServiceConfigInput<TDto, TModel extends SwapiResource> {
  readonly injector: Injector
  readonly resourcePath: string
  readonly mapDtoToModel: (dto: TDto) => TModel
  readonly cacheTtl?: number
}

interface SwapiResourceServiceConfig<
  TDto,
  TModel extends SwapiResource,
> extends SwapiResourceServiceConfigInput<TDto, TModel> {
  readonly cacheTtl: number
}

interface SwapiResourceItemResourceCacheEntry<TModel extends SwapiResource> {
  readonly resource: SwapiServiceResult<TModel | undefined>
  readonly expiresAt: number
}

export interface SwapiServiceResult<T> {
  status: Signal<ResourceStatus>
  data: Signal<T>
  errors: Signal<Error[] | undefined>
  reload: () => boolean
}

export class SwapiResourceService<
  TDto extends SwapiResourceDto,
  TModel extends SwapiResource,
> {
  private readonly itemResourceCache = new Map<
    string,
    SwapiResourceItemResourceCacheEntry<TModel>
  >()

  private readonly config: SwapiResourceServiceConfig<TDto, TModel>

  constructor(
    config: SwapiResourceServiceConfigInput<TDto, TModel>,
    private readonly itemCacheStore: SwapiItemCacheStore,
  ) {
    this.config = {
      ...config,
      cacheTtl:
        typeof config.cacheTtl === 'number' ? config.cacheTtl : DEFAULT_CACHE_TTL_MS,
    }
  }

  getCollection(
    page: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
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
          this.setCachedItem(item)
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
    options?: RetryableHttpResourceMethodOptions,
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
        this.setCachedItem(item)

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
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<TModel[]> {
    const getOrCreateResource = (id: string): SwapiServiceResult<TModel | undefined> => {
      const currentTime = Date.now()
      const cachedResourceEntry = this.itemResourceCache.get(id)
      if (cachedResourceEntry !== undefined) {
        if (cachedResourceEntry.expiresAt <= currentTime) {
          cachedResourceEntry.resource.reload()
          this.setResourceCacheEntry(id, cachedResourceEntry.resource)
        }

        return cachedResourceEntry.resource
      }

      const newResource = untracked(() =>
        this.getItem(
          computed(() => id),
          options,
        ),
      )
      this.setResourceCacheEntry(id, newResource)

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

  private setResourceCacheEntry(
    id: string,
    resource: SwapiServiceResult<TModel | undefined>,
  ): void {
    this.itemResourceCache.set(id, {
      resource,
      expiresAt: Date.now() + this.config.cacheTtl,
    })
  }

  private getCachedItem(id: string): TModel | undefined {
    return this.itemCacheStore.getItem<TModel>(this.config.resourcePath, id)
  }

  private setCachedItem(item: TModel): void {
    this.itemCacheStore.setItem(this.config.resourcePath, item, this.config.cacheTtl)
  }

  private static swapiUrl(
    pathSegments: string[],
    query?: ConstructorParameters<typeof URLSearchParams>[0],
  ): string {
    const path = pathSegments
      .map((pathSegment) => this.normalizePathSegment(pathSegment))
      .join('/')

    const urlString = `${SWAPI_BASE_URL_STRING}/${path}`

    if (query !== undefined) {
      const parameterString = new URLSearchParams(query).toString()
      if (!parameterString.length) {
        return new URL(urlString).toString()
      }

      return new URL(`${urlString}?${parameterString}`).toString()
    }

    return new URL(urlString).toString()
  }

  private static normalizePathSegment(value: string): string {
    return value.replace(/^\/+|\/+$/g, '')
  }
}
