import type { Serve } from 'bun'
import { Hono } from 'hono'

import { addAssetHandler } from '#internal/assets/asset.handler'
import { addDeviceContextHandler } from '#internal/device/device-context.handler'
import { addDeviceRedirectHandler } from '#internal/device/device-redirect.handler'
import { env } from '#internal/env'
import { addErrorHandler } from '#internal/error/error.handler'
import { addIndexingHandler } from '#internal/indexing/indexing.handler'
import { addRequestContextHandler } from '#internal/request/request-context.handler'
import { honoFetchWithForwardedProtocol } from '#internal/security/forwarded-headers'
import { addRequestGuardSecurityHandler } from '#internal/security/request-guard-security.handler'
import { addSecureHeadersSecurityHandler } from '#internal/security/secure-headers-security.handler'
import { addSsgHandler } from '#internal/ssg/ssg.handler'
import { addSsrHandler } from '#internal/ssr/ssr.handler'
import type { ServerEnv } from '#internal/types'

const hono = new Hono<ServerEnv>({ strict: false })

addRequestContextHandler(hono)
addSecureHeadersSecurityHandler(hono)
addRequestGuardSecurityHandler(hono)
addIndexingHandler(hono)
addDeviceContextHandler(hono)
addDeviceRedirectHandler(hono)
addAssetHandler(hono)
addSsgHandler(hono)
addSsrHandler(hono)
addErrorHandler(hono)

const fetch =
  env.SWAPI_TARGET === 'local' ? hono.fetch : honoFetchWithForwardedProtocol(hono)

const bunServerOptions = {
  hostname: env.SWAPI_SERVER_HOST_INTERNAL,
  port: env.SWAPI_SERVER_PORT,
  fetch,
} satisfies Serve.Options<undefined>

export default bunServerOptions
