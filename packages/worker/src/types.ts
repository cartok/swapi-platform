import type { DeviceContext } from '@swapi/shared/device/device'
import type { Hono } from 'hono'

export interface HonoEnv {
  Bindings: CloudflareBindings
  Variables: {
    deviceContext: DeviceContext
    isHtmlDocumentRequest: boolean
  }
}

export type Handler = (hono: Hono<HonoEnv>) => void
