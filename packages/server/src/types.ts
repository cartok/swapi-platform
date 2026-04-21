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

interface ServerPrivateRunContext {
  ready: boolean
  ssrReady: boolean
  shutdownStarted: boolean
  unhandledRejectionCount: number
}

interface HonoPrivateRunContext {
  inFlightRequests: number
}

export interface ServerRunContext
  extends ServerPrivateRunContext, Readonly<HonoPrivateRunContext> {}

export interface HonoRunContext
  extends HonoPrivateRunContext, Readonly<ServerPrivateRunContext> {}

export interface RunContext extends ServerPrivateRunContext, HonoPrivateRunContext {}
