import type { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { fromEvent, map, race, take, throwError } from 'rxjs'

import { SSR_ABORT_SIGNAL } from '@/http/ssr-abort-signal.token'

export const ssrAbortInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const signal = inject(SSR_ABORT_SIGNAL)
  if (signal === null) {
    return next(request)
  }

  if (signal.aborted) {
    return throwError(() => getAbortReason(signal))
  }

  const abort$ = fromEvent(signal, 'abort').pipe(
    take(1),
    map(() => {
      throw getAbortReason(signal)
    }),
  )

  return race(next(request), abort$)
}

function getAbortReason(signal: AbortSignal): DOMException {
  if (signal.reason instanceof DOMException) {
    return signal.reason
  }

  throw new TypeError(
    `Expected DOMException as SSR abort signal reason, got ${String(signal.reason)}.`,
  )
}
