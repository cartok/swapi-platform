import type { DeviceContext } from '@swapi/shared/device/device'
import type { Hono } from 'hono'

import type { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import type { RenderWorkerPool } from '#internal/ssr/render-worker-pool'
import type { RenderWorkerPoolMetrics } from '#internal/ssr/render-worker-pool.types'

export interface HonoEnv {
  Bindings: object
  Variables: {
    deviceContext: DeviceContext
    isHtmlDocumentRequest: boolean
    abortController: MultiSignalAbortController
  }
}

export type Handler = (
  hono: Hono<HonoEnv>,
  runtimeMetrics: HonoRuntimeMetrics,
  runtimeServices: HonoRuntimeServices,
) => void

export interface RuntimeMetrics {
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

export interface RuntimeServices {
  ssr: {
    renderPool: RenderWorkerPool
  }
}

export interface ServerRuntimeMetrics {
  server: RuntimeMetrics['server']
  hono: Readonly<RuntimeMetrics['hono']>
  ssrWorkerPool: RuntimeMetrics['ssrWorkerPool']
}

export interface HonoRuntimeMetrics {
  server: Readonly<RuntimeMetrics['server']>
  hono: RuntimeMetrics['hono']
  ssrWorkerPool: RuntimeMetrics['ssrWorkerPool']
}

export interface ServerRuntimeServices {
  ssr: RuntimeServices['ssr']
}

export interface HonoRuntimeServices {
  ssr: RuntimeServices['ssr']
}
