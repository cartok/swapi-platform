import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import {
  CommonEnvSchema,
  DynamicPortSchema,
  parseEnv,
} from '@swapi/shared/environment/env'

const E2EEnvSchema = Type.Intersect([
  CommonEnvSchema,
  Type.Object({
    CI: Type.Readonly(Type.Optional(Type.Boolean())),
    SWAPI_E2E_HOST_APP_SERVER: Type.Readonly(Type.String({ minLength: 1 })),
    SWAPI_E2E_HOST_APP_WORKER: Type.Readonly(Type.String({ minLength: 1 })),
    SWAPI_E2E_PORT_APP_SERVER: Type.Readonly(DynamicPortSchema),
    SWAPI_E2E_PORT_APP_WORKER: Type.Readonly(DynamicPortSchema),
    SWAPI_SERVER_PORT: Type.Readonly(Type.Optional(DynamicPortSchema)),
    TEST_WORKER_INDEX: Type.Readonly(Type.Optional(Type.Number())),
  }),
])

type E2EEnv = Static<typeof E2EEnvSchema>

export const env = parseEnv(E2EEnvSchema, {
  CI: process.env['CI'],
  SWAPI_E2E_HOST_APP_SERVER: process.env['SWAPI_E2E_HOST_APP_SERVER'],
  SWAPI_E2E_HOST_APP_WORKER: process.env['SWAPI_E2E_HOST_APP_WORKER'],
  SWAPI_E2E_PORT_APP_SERVER: process.env['SWAPI_E2E_PORT_APP_SERVER'],
  SWAPI_E2E_PORT_APP_WORKER: process.env['SWAPI_E2E_PORT_APP_WORKER'],
  SWAPI_LOCAL_E2E: process.env['SWAPI_LOCAL_E2E'],
  SWAPI_SERVER_PORT: process.env['SWAPI_SERVER_PORT'],
  TEST_WORKER_INDEX: process.env['TEST_WORKER_INDEX'],
}) satisfies E2EEnv
