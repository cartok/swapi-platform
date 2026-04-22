import { env, secretEnv } from '#internal/env'
import type { Handler, RunContext } from '#internal/types'

type HealthHttpStatus = 200 | 503

type HealthResponseBody = RunContext & {
  ok: boolean
  message?: string
}

interface HealthResponseData {
  body: HealthResponseBody
  status: HealthHttpStatus
}

export const addHealth: Handler = (hono, runContext) => {
  if (env.SWAPI_TARGET !== 'local') {
    hono.on(['GET', 'HEAD'], '/status/*', async (c, next) => {
      if (
        !secretEnv.SWAPI_SECRET_HEALTH_CHECK_TOKEN ||
        secretEnv.SWAPI_SECRET_HEALTH_CHECK_TOKEN !==
          c.req.header('X-Secret-Health-Check-Token')
      ) {
        return c.text('Forbidden', 400)
      }

      return next()
    })
  }

  hono.get('/status/live', (c) => {
    const status = checkLive(runContext)
    return c.body(null, status)
  })

  hono.get('/status/ready', (c) => {
    const responseData = checkReady(runContext)
    return c.json(responseData.body, responseData.status)
  })
}

function checkLive(runContext: RunContext): HealthHttpStatus {
  return runContext.shutdownStarted ? 503 : 200
}

function checkReady(runContext: RunContext): HealthResponseData {
  if (!runContext.ready || !runContext.ssrReady || runContext.shutdownStarted) {
    return { body: { ok: false, ...runContext }, status: 503 }
  }

  if (runContext.unhandledRejectionCount > 0) {
    return {
      body: {
        ok: false,
        ...runContext,
        message: `ready but ${runContext.unhandledRejectionCount} unhandled rejections so far`,
      },
      status: 200,
    }
  }

  return { body: { ok: true, ...runContext }, status: 200 }
}
