import type { Signal } from '@angular/core'
import { inject, Injectable, Injector } from '@angular/core'

import type { FilmDto } from '@/api/swapi/resources/films/films.dto'
import { mapFilmDtoToModel } from '@/api/swapi/resources/films/films.mapper'
import type { Film } from '@/api/swapi/resources/films/films.model'
import type { RetryableHttpResourceMethodOptions } from '@/api/swapi/shared/http/http-retry.interceptor'
import { SwapiItemCacheStore } from '@/api/swapi/shared/http/swapi-item-cache.store'
import type { SwapiServiceResult } from '@/api/swapi/shared/http/swapi-resource.service'
import { SwapiResourceService } from '@/api/swapi/shared/http/swapi-resource.service'
import type { SwapiResourceCollection } from '@/api/swapi/shared/types/model'

@Injectable()
export class FilmsService {
  private readonly injector = inject(Injector)
  private readonly itemCacheStore = inject(SwapiItemCacheStore)
  private readonly service = new SwapiResourceService<FilmDto, Film>(
    {
      injector: this.injector,
      resourcePath: 'films',
      mapDtoToModel: mapFilmDtoToModel,
    },
    this.itemCacheStore,
  )

  getCollection(
    page: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<SwapiResourceCollection<Film>> {
    return this.service.getCollection(page, options)
  }

  getItem(
    id: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<Film | undefined> {
    return this.service.getItem(id, options)
  }

  getItems(
    ids: Signal<string[]>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<Film[]> {
    return this.service.getItems(ids, options)
  }
}
