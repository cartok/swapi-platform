import type { HonoHandler } from '@swapi/hono/types'

import type { ServerHonoEnv } from '#internal/types'

export const addRobotsHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.get('*', (c, next) => {
    c.header('X-Robots-Tag', 'noindex, nofollow')
    return next()
  })
}
