import { ERROR_PATH } from '@swapi/shared/routing/paths'

import type { Handler } from '#internal/server.types'

export const addErrorHandler: Handler = (hono) => {
  hono.onError((error, c) => {
    console.error(error)

    if (isErrorPageUrl(c.req.url)) {
      return c.text('Server Error', 500)
    }

    return c.redirect('/error', 302)
  })
}

function isErrorPageUrl(url: string) {
  return new URL(url).pathname === `/${ERROR_PATH}`
}
