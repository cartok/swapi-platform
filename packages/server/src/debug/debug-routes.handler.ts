import type { Handler } from '#internal/types'

export const addDebugRoutesHandler: Handler = (hono) => {
  hono.get('/debug/fail-error', () => {
    throw Error('Triggered fail on error.')
  })

  hono.get('/debug/fail-promise', () => {
    return Promise.reject(new Error('Triggered fail on promise.'))
  })

  hono.get('/debug/slow-request', async (c) => {
    console.log('Slow request start.')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    console.log('Slow request end.')
    return c.text('Slow request response')
  })
}
