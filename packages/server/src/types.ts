import type { DeviceContext } from '@swapi/shared/device/context'
import type { Hono } from 'hono'

export interface HonoEnv {
  Bindings: object
  Variables: {
    deviceContext: DeviceContext
    isHtmlDocumentRequest: boolean
    runContext: HonoRunContext
  }
}

export type Handler<T = void> = (server: Hono<HonoEnv>, runContext: HonoRunContext) => T

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
