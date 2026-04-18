import type { Serve } from 'bun'
import { Hono } from 'hono'

import { addAssetHandler } from '#internal/assets/asset.handler'
import { addDeviceContextHandler } from '#internal/device/device-context.handler'
import { addDeviceRedirectHandler } from '#internal/device/device-redirect.handler'
import { env } from '#internal/env'
import { addErrorHandler } from '#internal/error/error.handler'
import { addRequestContextHandler } from '#internal/request/request-context.handler'
import { fetchWithForwardedProtocol } from '#internal/security/forwarded-headers.handler'
import { addSecurityHandler } from '#internal/security/security.handler'
import type { ServerEnv } from '#internal/server.types'
import { addSsgHandler } from '#internal/ssg/ssg.handler'
import { addSsrHandler } from '#internal/ssr/ssr.handler'

const hono = new Hono<ServerEnv>({ strict: false })

addSecurityHandler(hono)
addRequestContextHandler(hono)
addDeviceContextHandler(hono)
addDeviceRedirectHandler(hono)
addAssetHandler(hono)
addSsgHandler(hono)
addSsrHandler(hono)
addErrorHandler(hono)

const fetch = env.SWAPI_TARGET === 'local' ? hono.fetch : fetchWithForwardedProtocol(hono)

const bunServer = {
  hostname: env.SWAPI_SERVER_HOST_INTERNAL,
  port: env.SWAPI_SERVER_PORT,
  fetch,
} satisfies Serve.Options<undefined>

export default bunServer
