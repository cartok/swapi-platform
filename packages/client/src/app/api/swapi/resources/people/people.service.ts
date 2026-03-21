import { inject, Injectable, Injector, type Signal } from '@angular/core'

import type { PersonDto } from '@/app/api/swapi/resources/people/people.dto'
import { mapPersonDtoToModel } from '@/app/api/swapi/resources/people/people.mapper'
import type { Person } from '@/app/api/swapi/resources/people/people.model'
import { type RetryableHttpResourceMethodOptions } from '@/app/api/swapi/shared/http/http-retry.interceptor'
import { SwapiResourceService } from '@/app/api/swapi/shared/http/swapi-resource.service'
import type { SwapiResourceCollection } from '@/app/api/swapi/shared/types/model'
import type { SwapiServiceResult } from '@/app/api/swapi/shared/types/service'

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  private readonly injector = inject(Injector)
  private readonly service = new SwapiResourceService<PersonDto, Person>({
    injector: this.injector,
    resourcePath: 'people',
    mapDtoToModel: mapPersonDtoToModel,
  })

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
