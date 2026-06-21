import type { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { HttpErrorResponse, HttpResponse } from '@angular/common/http'
import { SWAPI_BASE_URL_STRING } from '@swapi/shared/apis/external/urls'
import { map, mergeMap, throwError, timer } from 'rxjs'

import type { SwapiMockResourcePath } from '@/api/swapi/swapi.mock-data'
import { getSwapiMockCollection, getSwapiMockItem } from '@/api/swapi/swapi.mock-data'

interface SwapiMockCollectionRequest {
  readonly type: 'collection'
  readonly resourcePath: SwapiMockResourcePath
  readonly page: number
}

interface SwapiMockItemRequest {
  readonly type: 'item'
  readonly resourcePath: SwapiMockResourcePath
  readonly id: string
}

type SwapiMockRequest = SwapiMockCollectionRequest | SwapiMockItemRequest

const SWAPI_MOCK_PATH_SET = new Set<SwapiMockResourcePath>(['films', 'people', 'planets'])
const SWAPI_MOCK_NOT_FOUND_BODY = {
  detail: 'Not found',
} as const
const SWAPI_BASE_API_URL = new URL(SWAPI_BASE_URL_STRING)
const SWAPI_BASE_PATH_SEGMENTS = normalizePathSegments(SWAPI_BASE_API_URL.pathname)
const SWAPI_MOCK_RESPONSE_DELAY_MIN_MS = 150
const SWAPI_MOCK_RESPONSE_DELAY_MAX_MS = 450

export const swapiMockInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (request.method !== 'GET') {
    return next(request)
  }

  const swapiMockRequest = parseSwapiMockRequest(request.urlWithParams)
  if (swapiMockRequest === undefined) {
    return next(request)
  }

  if (swapiMockRequest.type === 'collection') {
    const collection = getSwapiMockCollection(
      swapiMockRequest.resourcePath,
      swapiMockRequest.page,
    )
    if (collection === undefined) {
      return createNotFoundErrorResponse(request.urlWithParams)
    }

    return createSuccessResponse(request.urlWithParams, collection)
  }

  const item = getSwapiMockItem(swapiMockRequest.resourcePath, swapiMockRequest.id)
  if (item === undefined) {
    return createNotFoundErrorResponse(request.urlWithParams)
  }

  return createSuccessResponse(request.urlWithParams, item)
}

function createNotFoundErrorResponse(url: string) {
  return timer(getSwapiMockResponseDelayMs()).pipe(
    mergeMap(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            url,
            error: SWAPI_MOCK_NOT_FOUND_BODY,
          }),
      ),
    ),
  )
}

function createSuccessResponse<TBody>(url: string, body: TBody) {
  return timer(getSwapiMockResponseDelayMs()).pipe(
    map(
      () =>
        new HttpResponse({
          status: 200,
          body,
          url,
        }),
    ),
  )
}

function getSwapiMockResponseDelayMs(): number {
  return Math.floor(
    SWAPI_MOCK_RESPONSE_DELAY_MIN_MS +
      Math.random() *
        (SWAPI_MOCK_RESPONSE_DELAY_MAX_MS - SWAPI_MOCK_RESPONSE_DELAY_MIN_MS + 1),
  )
}

function parseSwapiMockRequest(urlString: string): SwapiMockRequest | undefined {
  let requestUrl: URL
  try {
    requestUrl = new URL(urlString)
  } catch {
    return undefined
  }

  if (requestUrl.origin !== SWAPI_BASE_API_URL.origin) {
    return undefined
  }

  const pathSegments = normalizePathSegments(requestUrl.pathname)
  const isApiPath =
    pathSegments.length >= SWAPI_BASE_PATH_SEGMENTS.length &&
    SWAPI_BASE_PATH_SEGMENTS.every((segment, index) => pathSegments[index] === segment)

  if (!isApiPath) {
    return undefined
  }

  const resourceSegment = pathSegments[SWAPI_BASE_PATH_SEGMENTS.length]
  if (resourceSegment === undefined || !isSwapiMockResourcePath(resourceSegment)) {
    return undefined
  }

  const nextSegment = pathSegments[SWAPI_BASE_PATH_SEGMENTS.length + 1]
  if (nextSegment === undefined) {
    const page = parsePage(requestUrl.searchParams.get('page'))
    return page === undefined
      ? undefined
      : {
          type: 'collection',
          resourcePath: resourceSegment,
          page,
        }
  }

  if (!/^\d+$/.test(nextSegment)) {
    return undefined
  }

  return {
    type: 'item',
    resourcePath: resourceSegment,
    id: nextSegment,
  }
}

function parsePage(value: string | null): number | undefined {
  if (value === null || value === '') {
    return 1
  }

  if (!/^\d+$/.test(value)) {
    return undefined
  }

  const page = Number(value)
  if (!Number.isInteger(page) || page < 1) {
    return undefined
  }

  return page
}

function normalizePathSegments(pathname: string): string[] {
  return pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

function isSwapiMockResourcePath(value: string): value is SwapiMockResourcePath {
  return SWAPI_MOCK_PATH_SET.has(value as SwapiMockResourcePath)
}
