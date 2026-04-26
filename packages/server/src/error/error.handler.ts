import { header } from '@swapi/shared/logging/utils'
import { PATHS } from '@swapi/shared/routing/paths'
import type { HTTPResponseError } from 'hono/types'

import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import type { Handler } from '#internal/types'

export const addErrorHandler: Handler = (hono, runContext) => {
  hono.onError((error, c) => {
    runContext.hono.caughtExceptions++

    try {
      console.error(header('Hono error handler'))

      if (GLOBAL_SWAPI_TARGET !== 'production') {
        console.error('Hono Environment:', JSON.stringify(c.env))
      }

      console.error('Hono Variables:', JSON.stringify(c.var))

      if (isHTTPResponseError(error)) {
        const errorResponse = error.getResponse()
        console.error(
          'Error Response:',
          JSON.stringify({
            status: errorResponse.status,
            statusText: errorResponse.statusText,
            text: errorResponse.statusText,
          }),
        )
      }

      console.error(
        'Error:',
        JSON.stringify({
          method: c.req.method,
          url: c.req.url,
          name: error.name,
          message: error.message,
        }),
      )

      console.error(error.stack)
    } catch (error) {
      console.error(error)
      c.text('Server Error', 500)
    }

    if (isErrorPageUrl(c.req.url)) {
      return c.text('Server Error', 500)
    }

    return c.redirect(`/${PATHS.SSG.ERROR_PATH}`)
  })
}

function isHTTPResponseError(error: unknown): error is HTTPResponseError {
  return (
    error instanceof Error &&
    typeof (error as { getResponse?: unknown }).getResponse === 'function'
  )
}

function isErrorPageUrl(url: string) {
  return new URL(url).pathname === `/${PATHS.SSG.ERROR_PATH}`
}
