import type { HonoHandler } from '@swapi/hono/types'

import type { ServerHonoEnv } from '#internal/types'

export const addFilterHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.get(
    '/.well-known/appspecific/com.chrome.devtools.json',
    () => new Response(null, { status: 204 }),
  )
}
