import type {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResourceRequest,
} from '@angular/common/http'
import { HttpContext, HttpContextToken, HttpErrorResponse } from '@angular/common/http'
import { retry, timer } from 'rxjs'

interface HttpRetryPolicy {
  enabled: boolean
  retryCount: number
  baseDelayMs: number
  maxDelayMs: number
}

export interface RetryableHttpResourceMethodOptions {
  retryPolicy?: Partial<HttpRetryPolicy>
}

const RETRYABLE_HTTP_METHODS = new Set<string>(['GET', 'HEAD'])
const DEFAULT_HTTP_RETRY_POLICY: HttpRetryPolicy = {
  enabled: true,
  retryCount: 2,
  baseDelayMs: 100,
  maxDelayMs: 1_000,
}

export const MINIMAL_HTTP_RETRY_POLICY: HttpRetryPolicy = {
  enabled: true,
  retryCount: 1,
  baseDelayMs: 150,
  maxDelayMs: 300,
}

export const CRITICAL_HTTP_RETRY_POLICY: HttpRetryPolicy = {
  enabled: true,
  retryCount: 3,
  baseDelayMs: 100,
  maxDelayMs: 1_500,
}

export const HTTP_RETRY_POLICY = new HttpContextToken<HttpRetryPolicy>(() => ({
  ...DEFAULT_HTTP_RETRY_POLICY,
}))

export const httpRetryInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (!RETRYABLE_HTTP_METHODS.has(request.method.toUpperCase())) {
    return next(request)
  }

  const retryPolicy = request.context.get(HTTP_RETRY_POLICY)
  if (!retryPolicy.enabled || retryPolicy.retryCount === 0) {
    return next(request)
  }

  return next(request).pipe(
    retry({
      count: retryPolicy.retryCount,
      delay: (error: unknown, retryAttempt: number) => {
        if (!isRetryableError(error)) {
          throw error
        }

        return timer(calculateDelayMs(retryAttempt, retryPolicy))
      },
    }),
  )
}

export function retryableHttpResourceRequest(
  urlFactory: () => string | undefined,
  retryPolicy?: Partial<HttpRetryPolicy>,
): () => HttpResourceRequest | undefined {
  return () => {
    const url = urlFactory()
    if (url === undefined) {
      return undefined
    }

    if (retryPolicy === undefined) {
      return { url }
    }

    return {
      url,
      context: new HttpContext().set(HTTP_RETRY_POLICY, {
        ...DEFAULT_HTTP_RETRY_POLICY,
        ...retryPolicy,
      }),
    }
  }
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false
  }

  if (isAbortError(error.error)) {
    return false
  }

  return isTransientStatusCode(error.status)
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.name === 'AbortError'
}

function isTransientStatusCode(statusCode: number): boolean {
  return statusCode === 0 || statusCode === 408 || statusCode === 429 || statusCode >= 500
}

function calculateDelayMs(retryAttempt: number, retryPolicy: HttpRetryPolicy): number {
  const exponentialDelay = retryPolicy.baseDelayMs * 2 ** (retryAttempt - 1)
  const jitter = Math.floor(Math.random() * retryPolicy.baseDelayMs)

  return Math.min(retryPolicy.maxDelayMs, exponentialDelay + jitter)
}
