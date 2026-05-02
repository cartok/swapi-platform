import { Hono } from 'hono'

import { addAssetHandler } from '#internal/assets/asset.handler'
import { addDebugRoutesHandler } from '#internal/debug/debug-routes.handler'
import { addDeviceContextHandler } from '#internal/device/device-context.handler'
import { addDeviceRedirectHandler } from '#internal/device/device-redirect.handler'
import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import { addErrorHandler } from '#internal/error/error.handler'
import { addHealthChecksHandler } from '#internal/health/health.handler'
import { addIndexingHandler } from '#internal/indexing/indexing.handler'
import { addAbortHandler } from '#internal/request/abort.handler'
import { addInFlightRequestsHandler } from '#internal/request/in-flight-requests.handler'
import { addRequestContextHandler } from '#internal/request/request-context.handler'
import { addRequestGuardHandler } from '#internal/security/request-guard-security.handler'
import { addSecureHeadersHandler } from '#internal/security/secure-headers-security.handler'
import { addSsgHandler } from '#internal/ssg/ssg.handler'
import { addSsrHandler } from '#internal/ssr/ssr.handler'
import type { HonoEnv, HonoRunContext } from '#internal/types'

export function createHono(runContext: HonoRunContext): Hono<HonoEnv> {
  const hono = new Hono<HonoEnv>({ strict: false })

  if (GLOBAL_SWAPI_TARGET === 'local') {
    addDebugRoutesHandler(hono, runContext)
  }

  addInFlightRequestsHandler(hono, runContext)
  addAbortHandler(hono, runContext)

  addHealthChecksHandler(hono, runContext)
  addRequestContextHandler(hono, runContext)
  addSecureHeadersHandler(hono, runContext)
  addRequestGuardHandler(hono, runContext)
  addIndexingHandler(hono, runContext)
  addAssetHandler(hono, runContext)
  addDeviceContextHandler(hono, runContext)
  addDeviceRedirectHandler(hono, runContext)
  addSsgHandler(hono, runContext)
  addSsrHandler(hono, runContext)

  addErrorHandler(hono, runContext)

  return hono
}
