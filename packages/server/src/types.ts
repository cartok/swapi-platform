import type { BaseHonoEnv } from '@swapi/hono/types'

import type { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import type { RenderWorkerPool } from '#internal/ssr/render-worker-pool'
import type { RenderWorkerPoolMetrics } from '#internal/ssr/render-worker-pool.types'

export type ServerHonoEnv = BaseHonoEnv<{
  Variables: {
    abortController: MultiSignalAbortController
  }
}>

interface RuntimeMetrics {
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
  ssrWorkerPool: RenderWorkerPoolMetrics
}

interface RuntimeServices {
  ssr: {
    renderPool: RenderWorkerPool
  }
}

export interface ServerRuntimeMetrics {
  server: RuntimeMetrics['server']
  hono: Readonly<RuntimeMetrics['hono']>
  ssrWorkerPool: RuntimeMetrics['ssrWorkerPool']
}

interface HonoRuntimeMetrics {
  server: Readonly<RuntimeMetrics['server']>
  hono: RuntimeMetrics['hono']
  ssrWorkerPool: RuntimeMetrics['ssrWorkerPool']
}

export interface HonoRuntimeOptions {
  runtimeMetrics: HonoRuntimeMetrics
  runtimeServices: RuntimeServices
}
