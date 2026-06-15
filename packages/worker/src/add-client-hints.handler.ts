import type { HonoHandler } from '@swapi/hono/types'

import type { WorkerHonoEnv } from '#internal/types'

export const addClientHintsHandler: HonoHandler<WorkerHonoEnv> = (hono) => {
  hono.get('*', (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    // Request high-entropy client hints (available from the next navigation/request).
    c.header(
      'Accept-CH',
      'Sec-CH-UA-Form-Factors, Sec-CH-Viewport-Width, Sec-CH-Viewport-Height',
    )

    return next()
  })
}
