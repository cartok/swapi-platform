import type { Context } from 'hono'

import { NO_STORE_CACHE_HEADERS } from '#internal/cache/cache'
import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import { toAbortReason } from '#internal/signal/signal'
import type { Handler, HonoEnv } from '#internal/types'

const TIMEOUT_GLOBAL = 5000

export const addAbortHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    const abortController = MultiSignalAbortController.createFromHonoContext<HonoEnv>(
      c,
    ).addTimeout({
      durationMs: TIMEOUT_GLOBAL,
      label: 'Global request timeout',
    })

    c.set('abortController', abortController)

    return next()
  })
}

export function createAbortResponse(c: Context<HonoEnv>, codeLocation: string): Response {
  const abortController = c.get('abortController')

  if (GLOBAL_SWAPI_TARGET !== 'production') {
    const info = {
      url: c.req.url,
      method: c.req.method,
      abortContext: {
        codeLocation,
        signalReason: toAbortReason(abortController.signal.reason),
        ...abortController.abortContext,
      },
    }

    console.debug('Aborted request:', JSON.stringify(info))
  }

  switch (abortController.abortContext.source) {
    case 'client':
      return c.text('Client aborted', 499 as never, NO_STORE_CACHE_HEADERS)
    case 'timeout':
      return c.text('Request timeout', 503, NO_STORE_CACHE_HEADERS)
  }
}
