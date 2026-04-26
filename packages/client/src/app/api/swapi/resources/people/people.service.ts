import type { Signal } from '@angular/core'
import { inject, Injectable, Injector } from '@angular/core'

import type { PersonDto } from '@/api/swapi/resources/people/people.dto'
import { mapPersonDtoToModel } from '@/api/swapi/resources/people/people.mapper'
import type { Person } from '@/api/swapi/resources/people/people.model'
import type { RetryableHttpResourceMethodOptions } from '@/api/swapi/shared/http/http-retry.interceptor'
import { SwapiItemCacheStore } from '@/api/swapi/shared/http/swapi-item-cache.store'
import type { SwapiServiceResult } from '@/api/swapi/shared/http/swapi-resource.service'
import { SwapiResourceService } from '@/api/swapi/shared/http/swapi-resource.service'
import type { SwapiResourceCollection } from '@/api/swapi/shared/types/model'

@Injectable()
export class PeopleService {
  private readonly injector = inject(Injector)
  private readonly itemCacheStore = inject(SwapiItemCacheStore)
  private readonly service = new SwapiResourceService<PersonDto, Person>(
    {
      injector: this.injector,
      resourcePath: 'people',
      mapDtoToModel: mapPersonDtoToModel,
    },
    this.itemCacheStore,
  )

  getCollection(
    page: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<SwapiResourceCollection<Person>> {
    return this.service.getCollection(page, options)
  }

  getItem(
    id: Signal<string>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<Person | undefined> {
    return this.service.getItem(id, options)
  }

  getItems(
    ids: Signal<string[]>,
    options?: RetryableHttpResourceMethodOptions,
  ): SwapiServiceResult<Person[]> {
    return this.service.getItems(ids, options)
  }
}
