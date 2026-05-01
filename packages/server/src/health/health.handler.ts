import { GLOBAL_SWAPI_TARGET, secretEnv } from '#internal/env'
import { runSwapiApiSmokeTest } from '#internal/health/external/swapi/swapi-api.smoke-test'
import { runSsrSmokeTest } from '#internal/health/ssr/ssr.smoke-test'
import { extractErrorMessage } from '#internal/shared/error'
import type { Handler } from '#internal/types'

export const addHealthChecksHandler: Handler = (hono, runContext) => {
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
    return c.body(null, runContext.server.shutdownStarted ? 503 : 200)
  })

  hono.get('/status/ready', (c) => {
    const isReady =
      !runContext.server.ready ||
      !runContext.server.ssrReady ||
      runContext.server.shutdownStarted
    return c.body(null, isReady ? 503 : 200)
  })

  hono.get('/status/errors', (c) => {
    if (!runContext.server.unhandledRejections && !runContext.hono.caughtExceptions) {
      return c.body(null, 200)
    } else {
      const text = [
        `Unhandled Promise Rejections: ${runContext.server.unhandledRejections}`,
        `Unhandled Exceptions: ${runContext.hono.caughtExceptions}`,
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
      return c.body(extractErrorMessage(error), 503)
    }
  })

  hono.get('/status/api/swapi', async (c) => {
    try {
      await runSwapiApiSmokeTest()
      return c.body(null, 200)
    } catch (error) {
      console.error(error)
      return c.text(extractErrorMessage(error), 503)
    }
  })
}
