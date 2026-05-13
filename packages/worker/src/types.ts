import type { BaseHonoEnv } from '@swapi/hono/types'

export type WorkerHonoEnv = BaseHonoEnv<{
  Bindings: CloudflareBindings
}>
