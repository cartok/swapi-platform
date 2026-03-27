import { Type } from '@sinclair/typebox'

import { CommonEnvSchema } from '../../shared/src/environment/env'

export const AppBrowserEnvSchema = Type.Intersect([
  CommonEnvSchema,
  Type.Object({
    SWAPI_DEV_TOOLS: Type.Readonly(Type.Boolean()),
  }),
])
