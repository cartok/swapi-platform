import type { Handler } from '#internal/types'

export const addInFlightRequestsHandler: Handler = (hono, runContext) => {
  hono.use('*', async (_c, next) => {
    runContext.inFlightRequests++
    try {
      return await next()
    } finally {
      runContext.inFlightRequests--
    }
  })
}
