import type {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResourceRequest,
} from '@angular/common/http'
import { HttpContext, HttpContextToken, HttpErrorResponse } from '@angular/common/http'
import { retry, tap, timer } from 'rxjs'

interface HttpRetryPolicy {
  retryCount: number
  startDelay: number
  endDelay?: number
}

export interface RetryableHttpResourceMethodOptions {
  readonly retryPolicy?: HttpRetryPolicy
}

const RETRYABLE_HTTP_METHODS = new Set<string>(['GET', 'HEAD'])
const DEFAULT_HTTP_REQUEST_TIMEOUT_MS = 4000

export const MINIMAL_HTTP_RETRY_POLICY: HttpRetryPolicy = {
  retryCount: 3,
  startDelay: 500,
}

export const CRITICAL_HTTP_RETRY_POLICY: HttpRetryPolicy = {
  retryCount: 5,
  startDelay: 300,
}

const httpContextToken = new HttpContextToken<HttpRetryPolicy>(
  () => MINIMAL_HTTP_RETRY_POLICY,
)

export const httpRetryInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (!RETRYABLE_HTTP_METHODS.has(request.method)) {
    return next(request)
  }

  const retryPolicy = request.context.get(httpContextToken)
  if (retryPolicy.retryCount === 0) {
    return next(request)
  }

  let lastRetryAttempt = 0

  return next(request).pipe(
    retry({
      count: retryPolicy.retryCount,
      delay: (error: unknown, retryAttempt: number) => {
        console.error(error)
        if (!isRetryableError(error)) {
          throw error
        }

        lastRetryAttempt = retryAttempt
        const delay = calculateDelayMs(retryAttempt, retryPolicy)
        console.warn(
          [
            `Will retry ${request.method} request to ${request.urlWithParams}`,
            `Start of ${retryAttempt}/${retryPolicy.retryCount} attempt after ${delay} ms.`,
          ].join('\n'),
        )
        return timer(delay)
      },
    }),
    tap({
      error: (error) => {
        console.error(error)
        if (lastRetryAttempt === retryPolicy.retryCount) {
          console.error(`Retries exhausted for ${request.urlWithParams}`)
        }
      },
    }),
  )
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false
  }

  if (isAbortLike(error.error) || isAbortLike(error)) {
    return false
  }

  return isRetryableStatusCode(error.status)
}

function isAbortLike(value: unknown): boolean {
  if (typeof DOMException !== 'undefined' && value instanceof DOMException) {
    return value.name === 'AbortError'
  }

  if (value instanceof ProgressEvent) {
    return value.type === 'abort'
  }

  if (value !== null && typeof value === 'object') {
    const maybe = value as { name?: unknown; code?: unknown }
    return maybe.name === 'AbortError' || maybe.code === 'ERR_ABORTED'
  }

  return false
}

function isRetryableStatusCode(statusCode: number): boolean {
  return statusCode === 0 || statusCode === 408 || statusCode === 429 || statusCode >= 500
}

function calculateDelayMs(retryAttempt: number, retryPolicy: HttpRetryPolicy): number {
  const exponentialBaseDelay = retryPolicy.startDelay * 2 ** (retryAttempt - 1)
  const baseDelay =
    retryPolicy.endDelay === undefined
      ? exponentialBaseDelay
      : Math.min(retryPolicy.endDelay, exponentialBaseDelay)

  const jitter = randomInRange(0, baseDelay * 0.3)
  const nextDelay = Math.floor(baseDelay + jitter)

  return nextDelay
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function retryableHttpResourceRequest(
  urlFactory: () => string,
  retryPolicy?: HttpRetryPolicy,
): () => HttpResourceRequest {
  return () => {
    const url = urlFactory()
    const request: HttpResourceRequest = {
      url,
      timeout: DEFAULT_HTTP_REQUEST_TIMEOUT_MS,
    }

    if (!retryPolicy) {
      return request
    }

    return {
      ...request,
      context: new HttpContext().set(httpContextToken, retryPolicy),
    }
  }
}
