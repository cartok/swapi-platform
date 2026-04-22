import { browserDistPath } from '@swapi/client/dist-paths'
import { serveStatic } from 'hono/bun'

import { env } from '#internal/env'
import type { Handler } from '#internal/types'

export const addAssetHandler: Handler = (hono) => {
  hono.on(
    ['GET', 'HEAD'],
    '*',
    serveStatic({
      root: browserDistPath,
      onFound: (_path, c) => {
        c.header(
          'cache-control',
          env.SWAPI_TARGET !== 'local' ? 'public, max-age=604800' : 'public, max-age=0',
        )
      },
    }),
  )
}
