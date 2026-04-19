import { browserDistPath } from '@swapi/client/dist-paths'
import { serveStatic } from 'hono/bun'

import { env } from '#internal/env'
import type { Handler } from '#internal/types'

export const addAssetHandler: Handler = (hono) => {
  const cacheControl =
    env.SWAPI_TARGET !== 'local' ? 'public, max-age=604800' : 'public, max-age=0'

  const serveStaticHandler = serveStatic({
    root: browserDistPath,
    onFound: (_path, c) => {
      c.header('cache-control', cacheControl)
    },
  })

  hono.on(['GET', 'HEAD'], '*', serveStaticHandler)
}
