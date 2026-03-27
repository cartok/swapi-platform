import type { Injector, ResourceStatus, Signal } from '@angular/core'

import type { RetryableHttpResourceMethodOptions } from '@/api/swapi/shared/http/http-retry.interceptor'
import type { SwapiResource } from '@/api/swapi/shared/types/model'

export interface SwapiServiceResult<T> {
  status: Signal<ResourceStatus>
  data: Signal<T>
  errors: Signal<Error[] | undefined>
  reload: () => boolean
}

export interface SwapiResourceServiceConfig<TDto, TModel extends SwapiResource> {
  readonly injector: Injector
  readonly resourcePath: string
  readonly mapDtoToModel: (dto: TDto) => TModel
  readonly itemCacheTtlMs?: number
}

export interface SwapiResourceServiceMethodOptions extends RetryableHttpResourceMethodOptions {
  readonly includeMinimalRetryForItems?: boolean
}
