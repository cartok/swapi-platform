import type { HonoHandler } from '@swapi/hono/types'

import { env } from '#internal/env'
import type { HonoRuntimeOptions, ServerHonoEnv } from '#internal/types'

export const addInFlightRequestsHandler: HonoHandler<
  ServerHonoEnv,
  HonoRuntimeOptions
> = (hono, { runtimeMetrics }) => {
  hono.use('*', async (_c, next) => {
    runtimeMetrics.hono.inFlightRequests++

    if (runtimeMetrics.hono.inFlightRequests > env.SWAPI_FLY_REQUEST_SOFT_LIMIT) {
      console.error(
        [
          `In-flight requests (${runtimeMetrics.hono.inFlightRequests}) exceeded`,
          `fly's soft-limit (${env.SWAPI_FLY_REQUEST_SOFT_LIMIT}).`,
        ].join(' '),
      )
    }

    try {
      return await next()
    } finally {
      runtimeMetrics.hono.inFlightRequests--
    }
  })
}
