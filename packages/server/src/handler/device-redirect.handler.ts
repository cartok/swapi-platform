import {
  deviceContextToPathSegment,
  isDeviceContextPathSegment,
} from '@swapi/shared/device/context'
import { ERROR_PATH } from '@swapi/shared/routing/paths'
import type { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import { env } from '#internal/env'
import { isHtmlDocumentRequest } from '#internal/handler/request-path.utils'
import type { ServerEnv } from '#internal/server.types'

const JUST_REDIRECTED_COOKIE_KEY = 'justRedirected'

export function addDeviceRedirectHandler(server: Hono<ServerEnv>): void {
  server.get('*', (c, next) => {
    if (
      !isHtmlDocumentRequest({
        method: c.req.method,
        pathname: c.req.path,
        acceptHeader: c.req.header('accept'),
      })
    ) {
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
    const currentUrl = createPathWithSearch(c.req.url)
    const deviceContextUrl = createDeviceContextUrl(currentUrl, deviceContextPathSegment)

    if (deviceContextUrl === currentUrl) {
      return next()
    }

    c.header('cache-control', 'no-store, private')
    setCookie(c, JUST_REDIRECTED_COOKIE_KEY, 'true', {
      sameSite: 'lax',
      httpOnly: true,
      secure: env.SWAPI_TARGET !== 'local',
      path: '/',
    })

    return c.redirect(deviceContextUrl, 302)
  })
}

function createPathWithSearch(absoluteUrl: string): string {
  const url = new URL(absoluteUrl)
  return url.pathname + url.search
}

function createDeviceContextUrl(
  originalUrl: string,
  deviceContextPathSegment: string,
): string {
  const tempUrl = new URL(originalUrl, 'http://1337') // host is not necessary
  const hadTrailingSlash = tempUrl.pathname.length > 1 && tempUrl.pathname.endsWith('/')
  const segments = tempUrl.pathname.split('/')
  segments.shift()

  if (isDeviceContextPathSegment.test(segments[0])) {
    segments.shift()
  }

  if (segments.length === 1 && segments[0] == '') {
    segments.shift()
  }

  const path = '/' + [deviceContextPathSegment, ...segments].join('/')
  const pathWithTrailingSlash =
    hadTrailingSlash || tempUrl.pathname === '/' ? `${path}/` : path
  const url = pathWithTrailingSlash + tempUrl.search

  return url
}
