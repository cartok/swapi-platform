import { errorToString } from '@swapi/shared/log/log'

import { GLOBAL_SWAPI_TARGET, secretEnv } from '#internal/env'
import { runSwapiApiSmokeTest } from '#internal/health/external/swapi/swapi-api.smoke-test'
import { runSsrSmokeTest } from '#internal/health/ssr/ssr.smoke-test'
import type { Handler } from '#internal/types'

export const addHealthChecksHandler: Handler = (hono, runtimeMetrics) => {
  if (GLOBAL_SWAPI_TARGET !== 'local') {
    hono.get('/status/*', async (c, next) => {
      if (
        !secretEnv.SWAPI_SECRET_HEALTH_CHECK_TOKEN ||
        secretEnv.SWAPI_SECRET_HEALTH_CHECK_TOKEN !==
          c.req.header('X-Secret-Health-Check-Token')
      ) {
        return c.body(null, 400)
      }
      return next()
    })
  }

  hono.get('/status/alife', (c) => {
    return c.body(null, runtimeMetrics.server.shutdownStarted ? 503 : 200)
  })

  hono.get('/status/ready', (c) => {
    const isReady =
      !runtimeMetrics.server.ready ||
      !runtimeMetrics.server.ssrReady ||
      runtimeMetrics.server.shutdownStarted
    return c.body(null, isReady ? 503 : 200)
  })

  hono.get('/status/errors', (c) => {
    if (
      !runtimeMetrics.server.unhandledRejections &&
      !runtimeMetrics.hono.caughtExceptions &&
      !runtimeMetrics.ssrWorkerPool.workerFailures
    ) {
      return c.body(null, 200)
    } else {
      const text = [
        `Unhandled Promise Rejections: ${runtimeMetrics.server.unhandledRejections}`,
        `Unhandled Exceptions: ${runtimeMetrics.hono.caughtExceptions}`,
        `SSR Worker Failures: ${runtimeMetrics.ssrWorkerPool.workerFailures}`,
      ].join(', ')
      return c.text(text, 503)
    }
  })

  hono.get('/status/ssr', async (c) => {
    try {
      await runSsrSmokeTest()
      return c.body(null, 200)
    } catch (error) {
      console.error(error)
      return c.body(errorToString(error), 503)
    }
  })

  hono.get('/status/api/swapi', async (c) => {
    try {
      await runSwapiApiSmokeTest()
      return c.body(null, 200)
    } catch (error) {
      console.error(error)
      return c.text(errorToString(error), 503)
    }
  })
}
