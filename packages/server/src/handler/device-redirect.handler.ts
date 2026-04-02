import type { DeviceContext } from '@swapi/shared/device/context'
import {
  deviceContextToPathSegment,
  isDeviceContextPathSegment,
} from '@swapi/shared/device/context'
import { ERROR_PATH } from '@swapi/shared/routing/paths'
import cookieParser from 'cookie-parser'
import type express from 'express'

import { env } from '#internal/env'
import { getRequestCookie } from '#internal/request-cookie'

const JUST_REDIRECTED_COOKIE_KEY = 'justRedirected'

export function addDeviceRedirectHandler(server: express.Express): void {
  server.get(/.*/, cookieParser(), (req, res, next) => {
    const justRedirectedCookie = getRequestCookie(req, JUST_REDIRECTED_COOKIE_KEY)

    if (justRedirectedCookie === 'true') {
      res.clearCookie(JUST_REDIRECTED_COOKIE_KEY)
      return next()
    }

    if (req.path.startsWith(`/${ERROR_PATH}`)) {
      return next()
    }

    if (/\.[a-zA-Z0-9]+$/.test(decodeURIComponent(req.path))) {
      return next()
    }

    // The server is source of truth for the device context in the URL.
    // Any existing device context parameter gets replaced.
    const deviceContext = res.locals['deviceContext'] as DeviceContext
    const deviceContextPathSegment = deviceContextToPathSegment(deviceContext)
    const deviceContextUrl = createDeviceContextUrl(req.url, deviceContextPathSegment)

    if (deviceContextUrl === req.url) {
      return next()
    }

    res.setHeader('cache-control', 'no-store, private')
    res.cookie(JUST_REDIRECTED_COOKIE_KEY, 'true', {
      sameSite: 'lax',
      httpOnly: true,
      secure: env.SWAPI_TARGET !== 'local',
      path: '/',
    })
    res.redirect(302, deviceContextUrl)
  })
}

function createDeviceContextUrl(originalUrl: string, deviceContextPathSegment: string) {
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
