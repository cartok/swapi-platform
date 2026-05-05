import { isAbortLikeError } from '@swapi/shared/errors/abort-error'
import {
  errorToString,
  logHeading,
  objectToString,
  responseToString,
} from '@swapi/shared/log/log'
import { PATHS } from '@swapi/shared/routing/paths'
import type { Context } from 'hono'

import { NO_STORE_CACHE_HEADERS } from '#internal/cache/cache'
import { isHonoHTTPResponseError } from '#internal/error/error'
import { createAbortResponse } from '#internal/request/request-abort.handler'
import type { Handler, HonoEnv } from '#internal/types'

export const addErrorHandler: Handler = (hono, runtimeMetrics) => {
  hono.onError((error, c) => {
    if (c.get('abortController').signal.aborted && isAbortLikeError(error)) {
      return createAbortResponse(c, 'Global error handler')
    }

    runtimeMetrics.hono.caughtExceptions++
    logError(error, c)

    if (isErrorPageUrl(c.req.url)) {
      return c.text('Internal Server Error', 500, NO_STORE_CACHE_HEADERS)
    }

    return c.redirect(`/${PATHS.SSG.ERROR_PATH}`)
  })
}

function logError(error: Error, c: Context<HonoEnv>): void {
  try {
    console.error(logHeading('hono error handler'))
    console.error(errorToString(error))

    if (isHonoHTTPResponseError(error)) {
      const response = error.getResponse()
      console.error(responseToString(response))
    }

    console.error(objectToString(c.var))
  } catch (error) {
    console.error(errorToString(error))
  }
}

function isErrorPageUrl(url: string) {
  return new URL(url).pathname === `/${PATHS.SSG.ERROR_PATH}`
}
