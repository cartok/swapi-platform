import type { Handler } from '#internal/types'

export const addRobotsHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    c.header('X-Robots-Tag', 'noindex, nofollow')
    return next()
  })
}
