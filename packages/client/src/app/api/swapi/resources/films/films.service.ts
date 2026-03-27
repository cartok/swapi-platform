import { inject, Injectable, Injector, type Signal } from '@angular/core'

import type { FilmDto } from '@/api/swapi/resources/films/films.dto'
import { mapFilmDtoToModel } from '@/api/swapi/resources/films/films.mapper'
import type { Film } from '@/api/swapi/resources/films/films.model'
import { type RetryableHttpResourceMethodOptions } from '@/api/swapi/shared/http/http-retry.interceptor'
import { SwapiResourceService } from '@/api/swapi/shared/http/swapi-resource.service'
import type { SwapiResourceCollection } from '@/api/swapi/shared/types/model'
import type { SwapiServiceResult } from '@/api/swapi/shared/types/service'

@Injectable({
  providedIn: 'root',
})
export class FilmsService {
  private readonly injector = inject(Injector)
  private readonly service = new SwapiResourceService<FilmDto, Film>({
    injector: this.injector,
    resourcePath: 'films',
    mapDtoToModel: mapFilmDtoToModel,
  })

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
