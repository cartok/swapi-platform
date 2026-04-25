import { header } from '@swapi/shared/logging/utils'
import { PATHS } from '@swapi/shared/routing/paths'

import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import type { Handler } from '#internal/types'

export const addErrorHandler: Handler = (hono, runContext) => {
  hono.onError((error, c) => {
    runContext.hono.caughtExceptions++

    console.error(header('Hono error handler'))
    console.error(error)
    if (GLOBAL_SWAPI_TARGET !== 'production') {
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
