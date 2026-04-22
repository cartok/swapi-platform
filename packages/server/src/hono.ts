import { Hono } from 'hono'

import { addAssetHandler } from '#internal/assets/asset.handler'
import { addDebugPaths as addDebugRoutesHandler } from '#internal/debug/debug.handler'
import { addDeviceContextHandler } from '#internal/device/device-context.handler'
import { addDeviceRedirectHandler } from '#internal/device/device-redirect.handler'
import { env } from '#internal/env'
import { addErrorHandler } from '#internal/error/error.handler'
import { addHealth as addHealthRoutesHandler } from '#internal/health/health.handler'
import { addIndexingHandler } from '#internal/indexing/indexing.handler'
import { addInFlightRequestsHandler } from '#internal/request/in-flight-requests.handler'
import { addRequestContextHandler } from '#internal/request/request-context.handler'
import { addRequestGuardSecurityHandler } from '#internal/security/request-guard-security.handler'
import { addSecureHeadersSecurityHandler } from '#internal/security/secure-headers-security.handler'
import { addSsgHandler } from '#internal/ssg/ssg.handler'
import { addSsrHandler } from '#internal/ssr/ssr.handler'
import type { HonoEnv, HonoRunContext } from '#internal/types'

export function createHono(runContext: HonoRunContext): Hono<HonoEnv> {
  const hono = new Hono<HonoEnv>({ strict: false })

  if (env.SWAPI_TARGET === 'local') {
    addDebugRoutesHandler(hono, runContext)
  }

  addInFlightRequestsHandler(hono, runContext)
  addHealthRoutesHandler(hono, runContext)
  addRequestContextHandler(hono, runContext)
  addSecureHeadersSecurityHandler(hono, runContext)
  addRequestGuardSecurityHandler(hono, runContext)
  addIndexingHandler(hono, runContext)
  addAssetHandler(hono, runContext)
  addDeviceContextHandler(hono, runContext)
  addDeviceRedirectHandler(hono, runContext)
  addSsgHandler(hono, runContext)
  addSsrHandler(hono, runContext)
  addErrorHandler(hono, runContext)

  return hono
}
