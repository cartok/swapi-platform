import type { HonoHandler } from '@swapi/hono/types'

import type { WorkerHonoEnv } from '#internal/types'

export const addHealthChecksHandler: HonoHandler<WorkerHonoEnv> = (hono) => {
  hono.get('/status/ready', (c) => {
    return c.body(null, 200)
  })
}
