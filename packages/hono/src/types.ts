import type { DeviceContext } from '@swapi/shared/device/device'
import type { Env, Hono } from 'hono'

type BindingsOf<env extends Env> = env extends { Bindings: infer bindings extends object }
  ? bindings
  : object

type VariablesOf<env extends Env> = env extends {
  Variables: infer variables extends object
}
  ? variables
  : object

export interface BaseHonoVariables {
  deviceContext: DeviceContext
  isHtmlDocumentRequest: boolean
}

export type BaseHonoEnv<env extends Env = Env> = Env & {
  Bindings: BindingsOf<env>
  Variables: BaseHonoVariables & Omit<VariablesOf<env>, keyof BaseHonoVariables>
}

export type HonoHandler<
  env extends BaseHonoEnv = BaseHonoEnv,
  options extends object | void = void,
> = [options] extends [void]
  ? (hono: Hono<env>) => void
  : (hono: Hono<env>, options: options) => void

export type SharedHonoHandler<
  env extends BaseHonoEnv = BaseHonoEnv,
  options extends object | void = void,
> = [options] extends [void]
  ? <currentEnv extends env>(hono: Hono<currentEnv>) => void
  : <currentEnv extends env>(hono: Hono<currentEnv>, options: options) => void
