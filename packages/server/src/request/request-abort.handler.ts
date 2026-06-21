import type { HonoHandler } from '@swapi/hono/types'
import { NO_STORE_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import type { Context } from 'hono'

import { DCE_BUILD_TARGET_ENVIRONMENT } from '#internal/env'
import { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import { toAbortReason } from '#internal/signal/signal'
import type { ServerHonoEnv } from '#internal/types'

const TIMEOUT_GLOBAL = 5000

export const addAbortHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.get('*', (c, next) => {
    const abortController = MultiSignalAbortController.createFromHonoContext(
      c,
    ).addTimeout({
      durationMs: TIMEOUT_GLOBAL,
      label: 'Global request timeout',
    })

    c.set('abortController', abortController)

    return next()
  })
}

export function createAbortResponse(
  c: Context<ServerHonoEnv>,
  codeLocation: string,
): Response {
  const abortController = c.get('abortController')

  if (DCE_BUILD_TARGET_ENVIRONMENT !== 'production') {
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
