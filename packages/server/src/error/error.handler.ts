import { PATHS } from '@swapi/shared/routing/paths'

import { env } from '#internal/env'
import { header } from '#internal/log'
import type { Handler } from '#internal/types'

export const addErrorHandler: Handler = (hono) => {
  hono.onError((error, c) => {
    console.error(header('Hono error handler'))
    console.error(error)
    if (env.SWAPI_TARGET !== 'production') {
      console.error('Variables:', c.var)
      console.error('Environment:', c.env)
    }

    if (isErrorPageUrl(c.req.url)) {
      return c.text('Server Error', 500)
    }

    return c.redirect(`/${PATHS.SSG.ERROR_PATH}`)
  })
}

function isErrorPageUrl(url: string) {
  return new URL(url).pathname === `/${PATHS.SSG.ERROR_PATH}`
}
