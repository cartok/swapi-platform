import { Hono } from 'hono'

import { addAssetHandler } from '#internal/assets/asset.handler'
import { addDebugRoutesHandler } from '#internal/debug/debug-routes.handler'
import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import { addErrorHandler } from '#internal/error/error.handler'
import { addHealthChecksHandler } from '#internal/health/health.handler'
import { addDocumentRequestContextHandler } from '#internal/request/document-request-context.handler'
import { addInFlightRequestsHandler } from '#internal/request/in-flight-requests.handler'
import { addAbortHandler } from '#internal/request/request-abort.handler'
import { addRobotsHandler } from '#internal/robots/robots.handler'
import { addRequestGuardHandler } from '#internal/security/request-guard-security.handler'
import { addSecureHeadersHandler } from '#internal/security/secure-headers-security.handler'
import { addSsgHandler } from '#internal/ssg/ssg.handler'
import { addSsrHandler } from '#internal/ssr/ssr.handler'
import type { HonoEnv, HonoRuntimeMetrics, HonoRuntimeServices } from '#internal/types'

export function createHono(
  runtimeMetrics: HonoRuntimeMetrics,
  runtimeServices: HonoRuntimeServices,
): Hono<HonoEnv> {
  const hono = new Hono<HonoEnv>({ strict: false })

  if (GLOBAL_SWAPI_TARGET === 'local') {
    hono.get(
      '/.well-known/appspecific/com.chrome.devtools.json',
      () => new Response(null, { status: 204 }),
    )
    addDebugRoutesHandler(hono, runtimeMetrics, runtimeServices)
  }

  addInFlightRequestsHandler(hono, runtimeMetrics, runtimeServices)
  addAbortHandler(hono, runtimeMetrics, runtimeServices)

  addHealthChecksHandler(hono, runtimeMetrics, runtimeServices)
  addDocumentRequestContextHandler(hono, runtimeMetrics, runtimeServices)
  addSecureHeadersHandler(hono, runtimeMetrics, runtimeServices)
  addRequestGuardHandler(hono, runtimeMetrics, runtimeServices)
  addRobotsHandler(hono, runtimeMetrics, runtimeServices)
  addAssetHandler(hono, runtimeMetrics, runtimeServices)
  addSsgHandler(hono, runtimeMetrics, runtimeServices)
  addSsrHandler(hono, runtimeMetrics, runtimeServices)

  addErrorHandler(hono, runtimeMetrics, runtimeServices)

  return hono
}
