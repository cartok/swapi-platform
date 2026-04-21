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
  hono.use('*', async (_c, next) => {
    runContext.inFlightRequests++
    try {
      return await next()
    } finally {
      runContext.inFlightRequests--
    }
  })

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
