import { env } from '#internal/env'
import type { Handler } from '#internal/types'

export const addInFlightRequestsHandler: Handler = (hono, runContext) => {
  hono.use('*', async (_c, next) => {
    runContext.hono.inFlightRequests++

    if (runContext.hono.inFlightRequests > env.SWAPI_FLY_REQUEST_SOFT_LIMIT) {
      console.error(
        [
          `In-flight requests (${runContext.hono.inFlightRequests}) exceeded`,
          `fly's soft-limit (${env.SWAPI_FLY_REQUEST_SOFT_LIMIT}).`,
        ].join(' '),
      )
    }

    try {
      return await next()
    } finally {
      runContext.hono.inFlightRequests--
    }
  })
}
