import { Injectable } from '@angular/core'

import type { SwapiResource } from '@/api/swapi/shared/types/model'

@Injectable({
  providedIn: 'root',
})
export class SwapiItemCacheStore {
  private readonly itemCache = new Map<string, SwapiItemCacheEntry>()

  getItem<TModel extends SwapiResource>(
    resourcePath: string,
    id: string,
  ): TModel | undefined {
    const cacheKey = SwapiItemCacheStore.cacheKey(resourcePath, id)
    const cacheEntry = this.itemCache.get(cacheKey)
    if (cacheEntry === undefined) {
      return undefined
    }

    if (cacheEntry.expiresAt <= Date.now()) {
      this.itemCache.delete(cacheKey)
      return undefined
    }

    return cacheEntry.item as TModel
  }

  setItem<TModel extends SwapiResource>(
    resourcePath: string,
    item: TModel,
    /**
     * Item cache duration in milliseconds.
     */
    ttl: number,
  ): void {
    const cacheKey = SwapiItemCacheStore.cacheKey(resourcePath, item.id)
    this.itemCache.set(cacheKey, {
      item,
      expiresAt: Date.now() + ttl,
    })
  }

  private static cacheKey(resourcePath: string, id: string): string {
    return `${resourcePath}:${id}`
  }
}

interface SwapiItemCacheEntry {
  readonly item: SwapiResource
  readonly expiresAt: number
}
