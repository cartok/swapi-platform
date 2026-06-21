import type { HonoHandler } from '@swapi/hono/types'
import { NO_STORE_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import { errorToString } from '@swapi/shared/log/log'

import { DCE_BUILD_TARGET_ENVIRONMENT, secretEnv } from '#internal/env'
import { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import { updateSsgPages } from '#internal/ssg/render'
import type { ServerHonoEnv } from '#internal/types'

export const addSsgRenderHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.post('/ssg', async (c) => {
    if (DCE_BUILD_TARGET_ENVIRONMENT !== 'local') {
      if (
        !secretEnv.SECRET_SSG_RENDER_TOKEN ||
        c.req.header('Authorization') !== `Bearer ${secretEnv.SECRET_SSG_RENDER_TOKEN}`
      ) {
        return c.body(null, 403, NO_STORE_CACHE_HEADERS)
      }
    }

    const abortController = MultiSignalAbortController.createFromHonoContext(
      c,
    ).addTimeout({
      durationMs: 10_000,
      label: 'SSG render timeout',
    })

    try {
      await updateSsgPages(abortController.signal)
      return c.body('Done SSG without error.')
    } catch (error) {
      console.error(error)
      return c.body(errorToString(error), 500, NO_STORE_CACHE_HEADERS)
    }
  })
}
