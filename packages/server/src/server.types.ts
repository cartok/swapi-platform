import type { DeviceContext } from '@swapi/shared/device/context'
import type { Env } from 'hono'

export type ServerEnv = Env & {
  Variables: {
    deviceContext: DeviceContext
  }
}
