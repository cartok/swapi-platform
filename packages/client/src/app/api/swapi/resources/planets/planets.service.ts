import type { Signal } from '@angular/core'
import { inject, Injectable, Injector } from '@angular/core'

import type { PlanetDto } from '@/api/swapi/resources/planets/planets.dto'
import { mapPlanetDtoToModel } from '@/api/swapi/resources/planets/planets.mapper'
import type { Planet } from '@/api/swapi/resources/planets/planets.model'
import { SwapiItemCacheStore } from '@/api/swapi/swapi-item-cache.store'
import type { SwapiServiceResult } from '@/api/swapi/swapi-resource.service'
import { SwapiResourceService } from '@/api/swapi/swapi-resource.service'
import type { SwapiResourceCollection } from '@/api/swapi/types/model'
import type { RetryableHttpResourceMethodOptions } from '@/http/http-retry.interceptor'

@Injectable()
export class PlanetsService {
  private readonly injector = inject(Injector)
  private readonly itemCacheStore = inject(SwapiItemCacheStore)
  private readonly service = new SwapiResourceService<PlanetDto, Planet>(
    {
      injector: this.injector,
      resourcePath: 'planets',
      mapDtoToModel: mapPlanetDtoToModel,
    },
    this.itemCacheStore,
  )

  getCollection(
    page: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<SwapiResourceCollection<Planet>> {
    return this.service.getCollection(page, options)
  }

  getItem(
    id: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<Planet | undefined> {
    return this.service.getItem(id, options)
  }

  getItems(
    ids: Signal<string[]>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<Planet[]> {
    return this.service.getItems(ids, options)
  }
}
