import type { DeviceContext } from '@swapi/shared/device/context'
import type { Hono } from 'hono'

import type { HonoAbortControllerInterface } from '#internal/request/abort.handler'

export interface HonoEnv {
  Bindings: object
  Variables: {
    deviceContext: DeviceContext
    isHtmlDocumentRequest: boolean
    runContext: HonoRunContext
    abortController: HonoAbortControllerInterface
  }
}

export type Handler<T = void> = (hono: Hono<HonoEnv>, runContext: HonoRunContext) => T

export interface RunContext {
  server: {
    ready: boolean
    ssrReady: boolean
    shutdownStarted: boolean
    unhandledRejections: number
  }
  hono: {
    inFlightRequests: number
    caughtExceptions: number
  }
}

export interface ServerRunContext {
  server: RunContext['server']
  hono: Readonly<RunContext['hono']>
}

export interface HonoRunContext {
  server: Readonly<RunContext['server']>
  hono: RunContext['hono']
}
