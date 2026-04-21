import type { MiddlewareHandler } from 'hono'
import { secureHeaders } from 'hono/secure-headers'

import { env } from '#internal/env'
import type { Handler, ServerEnv } from '#internal/types'

const globalSecureHeaders: MiddlewareHandler<ServerEnv> = secureHeaders({
  strictTransportSecurity: env.SWAPI_TARGET !== 'production' ? false : 'max-age=300',
})

const htmlDocumentSecureHeaders: MiddlewareHandler<ServerEnv> = secureHeaders({
  // Base security headers are already set by `globalSecureHeaders`.
  // Disable defaults here so this middleware only adds HTML-document policies
  // (CSP + Permissions-Policy) and does not override global values like HSTS.
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
  referrerPolicy: false,
  strictTransportSecurity: false,
  xContentTypeOptions: false,
  xDnsPrefetchControl: false,
  xDownloadOptions: false,
  xFrameOptions: false,
  xPermittedCrossDomainPolicies: false,
  xXssProtection: false,
  removePoweredBy: false,
  permissionsPolicy: {
    bluetooth: [],
    camera: [],
    displayCapture: [],
    fullscreen: [],
    geolocation: [],
    hid: [],
    microphone: [],
    midi: [],
    payment: [],
    serial: [],
    usb: [],
  },
  contentSecurityPolicy: {
    baseUri: ["'self'"],
    connectSrc: ["'self'", 'https://swapi.dev'],
    fontSrc: ["'self'", 'data:'],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    imgSrc: ["'self'", 'data:', 'https://picsum.photos', 'https://*.picsum.photos'],
    manifestSrc: ["'self'"],
    objectSrc: ["'none'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
  contentSecurityPolicyReportOnly: {
    scriptSrc: ["'self'"],
  },
})

export const addSecureHeadersSecurityHandler: Handler = (hono) => {
  hono.use('*', globalSecureHeaders)
  hono.get('*', (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    return htmlDocumentSecureHeaders(
      c as Parameters<typeof htmlDocumentSecureHeaders>[0],
      next,
    )
  })
}
