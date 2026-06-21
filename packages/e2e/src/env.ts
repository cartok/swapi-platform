import { Type } from '@sinclair/typebox'
import { parseEnv } from '@swapi/shared/environment/env'
import {
  DynamicPortSchema,
  IsLocalEndToEndSchema,
} from '@swapi/shared/environment/env.schema'

const EndToEndEnvSchema = Type.Object({
  APP_SERVER_HOSTNAME: Type.Readonly(Type.String({ minLength: 1 })),
  APP_SERVER_PORT: Type.Readonly(DynamicPortSchema),
  APP_WORKER_HOSTNAME: Type.Readonly(Type.String({ minLength: 1 })),
  APP_WORKER_PORT: Type.Readonly(DynamicPortSchema),
  CI: Type.Readonly(Type.Optional(Type.Boolean())),
  IS_LOCAL_E2E: Type.Readonly(IsLocalEndToEndSchema),
  TEST_WORKER_INDEX: Type.Readonly(Type.Optional(Type.Number())),
})

export const runEnv = parseEnv(EndToEndEnvSchema, {
  APP_SERVER_HOSTNAME: process.env['APP_SERVER_HOSTNAME'],
  APP_SERVER_PORT: process.env['APP_SERVER_PORT'],
  APP_WORKER_HOSTNAME: process.env['APP_WORKER_HOSTNAME'],
  APP_WORKER_PORT: process.env['APP_WORKER_PORT'],
  CI: process.env['CI'],
  IS_LOCAL_E2E: process.env['IS_LOCAL_E2E'],
  TEST_WORKER_INDEX: process.env['TEST_WORKER_INDEX'],
})
