import { addDocumentRequestContextHandler } from '@swapi/hono/request/document-request-context.handler'
import { NO_STORE_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import { isErrorPagePath } from '@swapi/shared/routing/is-error-page-path'
import { PATHS } from '@swapi/shared/routing/paths'
import { env } from 'cloudflare:workers'
import { Hono } from 'hono'

import { addClientHintsHandler } from '#internal/add-client-hints.handler'
import { addDeviceRedirectHandler } from '#internal/device-redirect.handler'
import { addHealthChecksHandler } from '#internal/health-checks.handler'
import type { WorkerHonoEnv } from '#internal/types'

const hono = new Hono<WorkerHonoEnv>()

addHealthChecksHandler(hono)
addDocumentRequestContextHandler(hono)
addClientHintsHandler(hono)
addDeviceRedirectHandler(hono)

hono.get('*', (c) => {
  const requestUrl = new URL(c.req.url)
  const relativeRequestUrl = requestUrl.pathname + requestUrl.search
  const originBaseUrl = `${env.ORIGIN_PROTOCOL}://${env.ORIGIN_HOST}:${env.ORIGIN_PORT}`
  const originUrl = new URL(relativeRequestUrl, originBaseUrl)
  const request = new Request(originUrl, c.req.raw)

  if (c.req.raw.signal.aborted) {
    return c.text('Client aborted', 499 as never, NO_STORE_CACHE_HEADERS)
  }

  return fetch(request)
})

hono.onError((error, c) => {
  console.error(error)
  if (isErrorPagePath(c.req.path)) {
    return c.text('Internal Server Error', 500, NO_STORE_CACHE_HEADERS)
  }

  return c.redirect(`/${PATHS.SSG.ERROR_PATH}`)
})

export default hono
