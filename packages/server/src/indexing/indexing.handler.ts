import type { Handler } from '#internal/server.types'

export const addIndexingHandler: Handler = (hono) => {
  hono.use('*', (c, next) => {
    c.header('X-Robots-Tag', 'noindex, nofollow')
    return next()
  })
}
