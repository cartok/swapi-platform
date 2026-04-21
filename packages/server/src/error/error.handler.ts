import { PATHS } from '@swapi/shared/routing/paths'

import type { Handler } from '#internal/types'

export const addErrorHandler: Handler = (hono) => {
  hono.onError((error, c) => {
    console.error(error)

    if (isErrorPageUrl(c.req.url)) {
      return c.text('Server Error', 500)
    }

    return c.redirect(`/${PATHS.SSG.ERROR_PATH}`)
  })
}

function isErrorPageUrl(url: string) {
  return new URL(url).pathname === `/${PATHS.SSG.ERROR_PATH}`
}
