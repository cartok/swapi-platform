import type { DeviceContext } from '@swapi/shared/device/context'
import type { Env, Hono } from 'hono'

export type ServerEnv = Env & {
  Variables: {
    deviceContext: DeviceContext
    isHtmlDocumentRequest: boolean
  }
}

export type Handler<T = void> = (server: Hono<ServerEnv>) => T
