import { NO_STORE_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import {
  DeviceContextSchema,
  deviceContextToPathSegment,
  extractDeviceContextFromPath,
  getIsDeviceContextPath as checkIfDeviceContextPath,
  parseDeviceContext,
} from '@swapi/shared/device/device'
import { isErrorPagePath } from '@swapi/shared/routing/is-error-page-path'

import { parseDeviceContextFromHeaders } from '#internal/device-context'
import type { Handler } from '#internal/types'

export const addDeviceRedirectHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    if (isErrorPagePath(c.req.path)) {
      return next()
    }

    const isDeviceContextPath = checkIfDeviceContextPath(c.req.path)
    if (isDeviceContextPath) {
      const deviceContextRecord = extractDeviceContextFromPath(c.req.path)
      const deviceContext = deviceContextRecord
        ? parseDeviceContext(deviceContextRecord, DeviceContextSchema)
        : null

      if (deviceContext) {
        c.set('deviceContext', deviceContext)

        return next()
      }
    }

    const deviceContext = parseDeviceContextFromHeaders(c)
    c.set('deviceContext', deviceContext)

    const deviceContextPathSegment = deviceContextToPathSegment(deviceContext)
    const originalUrl = new URL(c.req.url)
    const relativeRedirectUrl = createRedirectUrl({
      pathname: originalUrl.pathname,
      search: originalUrl.search,
      deviceContextPathSegment,
      stripFirstPathSegment: isDeviceContextPath,
    })

    for (const [k, v] of Object.entries(NO_STORE_CACHE_HEADERS)) {
      c.header(k, v)
    }

    return c.redirect(relativeRedirectUrl)
  })
}

function createRedirectUrl({
  pathname,
  search,
  deviceContextPathSegment,
  stripFirstPathSegment,
}: {
  pathname: string
  search: string
  deviceContextPathSegment: string
  stripFirstPathSegment: boolean
}): string {
  const pathWithoutDevicePrefix = !stripFirstPathSegment
    ? pathname
    : removeFirstPathSegment(pathname)

  return `/${deviceContextPathSegment}${pathWithoutDevicePrefix}${search}`
}

function removeFirstPathSegment(pathname: string): string {
  const secondPathSeparatorIndex = pathname.indexOf('/', 1)
  if (secondPathSeparatorIndex === -1) {
    return '/'
  }

  return pathname.slice(secondPathSeparatorIndex)
}
