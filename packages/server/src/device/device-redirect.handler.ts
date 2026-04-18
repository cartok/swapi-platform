import {
  deviceContextToPathSegment,
  isDeviceContextPathSegment,
} from '@swapi/shared/device/context'
import { ERROR_PATH } from '@swapi/shared/routing/paths'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import { env } from '#internal/env'
import type { Handler } from '#internal/server.types'

const JUST_REDIRECTED_COOKIE_KEY = 'justRedirected'

export const addDeviceRedirectHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    const justRedirectedCookie = getCookie(c, JUST_REDIRECTED_COOKIE_KEY)

    if (justRedirectedCookie === 'true') {
      deleteCookie(c, JUST_REDIRECTED_COOKIE_KEY, { path: '/' })
      return next()
    }

    if (c.req.path.startsWith(`/${ERROR_PATH}`)) {
      return next()
    }

    // The server is source of truth for the device context in the URL.
    // Any existing device context parameter gets replaced.
    const deviceContext = c.get('deviceContext')
    const deviceContextPathSegment = deviceContextToPathSegment(deviceContext)
    const requestUrl = new URL(c.req.url)
    const relativeRequestUrl = requestUrl.pathname + requestUrl.search
    const relativeDeviceContextUrl = createRelativeDeviceContextUrl({
      pathname: requestUrl.pathname,
      search: requestUrl.search,
      deviceContextPathSegment,
    })

    if (relativeDeviceContextUrl === relativeRequestUrl) {
      return next()
    }

    c.header('cache-control', 'no-store, private')
    setCookie(c, JUST_REDIRECTED_COOKIE_KEY, 'true', {
      sameSite: 'lax',
      httpOnly: true,
      secure: env.SWAPI_TARGET !== 'local',
      path: '/',
    })

    return c.redirect(relativeDeviceContextUrl, 302)
  })
}

function createRelativeDeviceContextUrl({
  pathname,
  search,
  deviceContextPathSegment,
}: {
  pathname: string
  search: string
  deviceContextPathSegment: string
}): string {
  const hadTrailingSlash = pathname.length > 1 && pathname.endsWith('/')
  const segments = pathname.split('/')
  segments.shift()

  if (isDeviceContextPathSegment.test(segments[0])) {
    segments.shift()
  }

  if (segments.length === 1 && segments[0] == '') {
    segments.shift()
  }

  const path = '/' + [deviceContextPathSegment, ...segments].join('/')
  const pathWithTrailingSlash = hadTrailingSlash || pathname === '/' ? `${path}/` : path
  const url = pathWithTrailingSlash + search

  return url
}
