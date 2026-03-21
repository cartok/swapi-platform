import { inject, Injectable, Injector, type Signal } from '@angular/core'

import type { PlanetDto } from '@/app/api/swapi/resources/planets/planets.dto'
import { mapPlanetDtoToModel } from '@/app/api/swapi/resources/planets/planets.mapper'
import type { Planet } from '@/app/api/swapi/resources/planets/planets.model'
import { type RetryableHttpResourceMethodOptions } from '@/app/api/swapi/shared/http/http-retry.interceptor'
import { SwapiResourceService } from '@/app/api/swapi/shared/http/swapi-resource.service'
import type { SwapiResourceCollection } from '@/app/api/swapi/shared/types/model'
import type { SwapiServiceResult } from '@/app/api/swapi/shared/types/service'

@Injectable({
  providedIn: 'root',
})
export class PlanetsService {
  private readonly injector = inject(Injector)
  private readonly service = new SwapiResourceService<PlanetDto, Planet>({
    injector: this.injector,
    resourcePath: 'planets',
    mapDtoToModel: mapPlanetDtoToModel,
  })

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
