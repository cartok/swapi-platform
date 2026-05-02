import { isAbortLikeError } from '@swapi/shared/errors/abort-error'
import { header } from '@swapi/shared/logging/utils'
import { PATHS } from '@swapi/shared/routing/paths'
import type { Context } from 'hono'

import { NO_STORE_CACHE_HEADERS } from '#internal/cache/cache'
import { isHTTPResponseError } from '#internal/error/error'
import { abortResponse } from '#internal/request/abort.handler'
import type { Handler, HonoEnv } from '#internal/types'

export const addErrorHandler: Handler = (hono, runContext) => {
  hono.onError((error, c) => {
    if (c.get('abortController').signal.aborted && isAbortLikeError(error)) {
      return abortResponse(c, 'Global error handler')
    }

    runContext.hono.caughtExceptions++
    logError(error, c)

    if (isErrorPageUrl(c.req.url)) {
      return c.text('Internal Server Error', 500, NO_STORE_CACHE_HEADERS)
    }

    return c.redirect(`/${PATHS.SSG.ERROR_PATH}`)
  })
}

function logError(error: Error, c: Context<HonoEnv>): void {
  try {
    console.error(header('hono error handler'))
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
  }
}

function isErrorPageUrl(url: string) {
  return new URL(url).pathname === `/${PATHS.SSG.ERROR_PATH}`
}
