import { addDocumentRequestContextHandler } from '@swapi/hono/request/document-request-context.handler'
import { Hono } from 'hono'

import { addAssetHandler } from '#internal/assets/asset.handler'
import { addDebugRoutesHandler } from '#internal/dev/debug-routes.handler'
import { addFilterHandler } from '#internal/dev/filter.handler'
import { addErrorHandler } from '#internal/error/error.handler'
import { addHealthChecksHandler } from '#internal/health/health-checks.handler'
import { addInFlightRequestsHandler } from '#internal/request/in-flight-requests.handler'
import { addAbortHandler } from '#internal/request/request-abort.handler'
import { addRobotsHandler } from '#internal/robots/robots.handler'
import { addRequestGuardHandler } from '#internal/security/request-guard-security.handler'
import { addSecureHeadersHandler } from '#internal/security/secure-headers-security.handler'
import { addSsgHandler } from '#internal/ssg/ssg.handler'
import { addSsrHandler } from '#internal/ssr/ssr.handler'
import type { HonoRuntimeOptions, ServerHonoEnv } from '#internal/types'

export function createHono(runtimeOptions: HonoRuntimeOptions): Hono<ServerHonoEnv> {
  const hono = new Hono<ServerHonoEnv>({ strict: false })

  if (DCE_SWAPI_TARGET_ENVIRONMENT === 'local') {
    addFilterHandler(hono)
    addDebugRoutesHandler(hono)
  }

  addInFlightRequestsHandler(hono, runtimeOptions)
  addAbortHandler(hono)

  addHealthChecksHandler(hono, runtimeOptions)

  addDocumentRequestContextHandler(hono)
  addSecureHeadersHandler(hono)
  addRequestGuardHandler(hono)
  addRobotsHandler(hono)
  addAssetHandler(hono)
  addSsgHandler(hono)
  addSsrHandler(hono, runtimeOptions)

  addErrorHandler(hono, runtimeOptions)

  return hono
}
