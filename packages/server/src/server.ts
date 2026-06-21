import fs from 'node:fs'
import { availableParallelism, constants } from 'node:os'
import process, { resourceUsage } from 'node:process'

import { errorToString, logHeading, objectToString } from '@swapi/shared/log/log'

import {
  buildEnv,
  DCE_BUILD_TARGET_ENVIRONMENT,
  runEnv,
  validateRuntimeSecretEnv,
} from '#internal/env'
import { validateBuildEnvManifest } from '#internal/env.manifest'
import { createHono } from '#internal/hono'
import { logServerEnv, logSystemEnv } from '#internal/log/log-env'
import { RenderWorkerPool } from '#internal/ssr/render-worker-pool'
import type { RenderWorkerPoolConfig } from '#internal/ssr/render-worker-pool.types'
import type { HonoRuntimeOptions, ServerRuntimeMetrics } from '#internal/types'

console.info(`Process id is: ${process.pid}`)
if (
  DCE_BUILD_TARGET_ENVIRONMENT !== 'local' &&
  DCE_BUILD_TARGET_ENVIRONMENT !== 'production' &&
  runEnv.RUN_LOG_LEVEL === 'debug'
) {
  logSystemEnv()
}
logServerEnv()

// The timeout should be lower than the one defined in fly config for that health check.
const FORCE_EXIT_TIMEOUT = 7_500
const INFLIGHT_REQUESTS_TIMEOUT = 6_000
const INFLIGHT_REQUESTS_POLL = 100

const runtimeMetrics: ServerRuntimeMetrics = {
  server: {
    ready: false,
    ssrReady: false,
    shutdownStarted: false,
    unhandledRejections: 0,
  },
  hono: {
    inFlightRequests: 0,
    caughtExceptions: 0,
  },
  ssrWorkerPool: {
    workerFailures: 0,
    workerRestarts: 0,
    workerTerminations: 0,
    clientAborts: 0,
    requestTimeoutAborts: 0,
    renderTimeoutAborts: 0,
  },
} as const

const renderWorkerPoolPromise = RenderWorkerPool.create(resolveRenderWorkerPoolConfig())

function resolveRenderWorkerPoolConfig(): RenderWorkerPoolConfig {
  const baseRenderWorkerPoolConfig = {
    workerFile: resolveRenderWorkerFile(),
    metrics: runtimeMetrics.ssrWorkerPool,
  } satisfies Partial<RenderWorkerPoolConfig>

  function resolveRenderWorkerFile(): URL {
    const renderWorkerFileName =
      process.env['SWAPI_SSR_WORKER_VARIANT'] === 'jit'
        ? 'render-worker.jit.js'
        : 'render-worker.js'

    return new URL(`./ssr/${renderWorkerFileName}`, import.meta.url)
  }

  if (
    DCE_BUILD_TARGET_ENVIRONMENT === 'local' &&
    runEnv.RUN_IS_LOCAL_E2E &&
    runEnv.RUN_USE_LOCAL_E2E_CACHE
  ) {
    const cores = availableParallelism()
    const coresMaxPercent = 0.4
    const coresMax = Math.max(Math.floor(cores * coresMaxPercent), 1)

    const devE2eWorkerPoolConfig = {
      ...baseRenderWorkerPoolConfig,
      workerCount: coresMax,
      maxQueuedJobs: 20 * coresMax,
      // Settings below are copied from the fly settings and could be improved by a benchmark.
      queueTimeoutMs: 1_400,
      renderAbortTimeoutMs: 3_200,
      requestAbortWorkerGraceMs: 500,
      renderTimeoutWorkerGraceMs: 500,
      workerRecoveryInitialBackoffMs: 50,
      workerRecoveryMaxBackoffMs: 500,
      workerRecoveryMaxAttempts: 5,
      workerRecoveryCooldownMs: 2_000,
    } satisfies RenderWorkerPoolConfig

    console.info('Using SSR worker pool config that is optimized for E2E testing.')
    return devE2eWorkerPoolConfig
  }

  /**
   * Benchmark setup:
   * - Docker server start via `go-task docker:start` with Taskfile CPU/RAM throttling profile.
   * - Synthetic request load via curl (`-L`) against SSR routes: `/movies` and `/movie/1`.
   * - load_80: 80 requests per route at concurrency 8.
   * - load_200: 200 requests per route at concurrency 20.
   * - Artificial constant SSR latency: 65ms delay before worker-pool render call.
   * - Mock data for SWAPI with artificial delay range.
   * - Metrics recorded: 2xx rate, success_rps, p95 latency, plus 503 and transport failures (000).
   *
   * Benchmark winners:
   * 1 CPU / 256MB (Profile C):
   * - workerCount=1, maxQueuedJobs=40, queueTimeoutMs=1400, renderAbortTimeoutMs=3200,
   *   TIMEOUT_GLOBAL=5000
   * - aggregated (/movies + /movie/1, load_80 + load_200): 23.75% 2xx, success_rps=2.02, p95=1.897s
   * - fly concurrency (requests): soft_limit=5, hard_limit=8
   *
   * 1 CPU / 512MB (Profile C):
   * - workerCount=2, maxQueuedJobs=40, queueTimeoutMs=1400, renderAbortTimeoutMs=3200,
   *   TIMEOUT_GLOBAL=5000
   * - aggregated (/movies + /movie/1, load_80 + load_200): 46.79% 2xx, success_rps=3.98, p95=1.959s
   * - fly concurrency (requests): soft_limit=8, hard_limit=12
   *
   * 2 CPU / 512MB (Profile C):
   * - workerCount=2, maxQueuedJobs=40, queueTimeoutMs=1400, renderAbortTimeoutMs=3200,
   *   TIMEOUT_GLOBAL=5000
   * - aggregated (/movies + /movie/1, load_80 + load_200): 47.32% 2xx, success_rps=4.04, p95=1.935s
   * - fly concurrency (requests): soft_limit=10, hard_limit=16
   *
   * Fly costs:
   * - https://fly.io/docs/about/pricing/#started-fly-machines
   */
  const flyRenderWorkerPoolConfig = {
    ...baseRenderWorkerPoolConfig,
    workerCount: 2,
    maxQueuedJobs: 40,
    queueTimeoutMs: 1_400,
    renderAbortTimeoutMs: 3_200,
    requestAbortWorkerGraceMs: 500,
    renderTimeoutWorkerGraceMs: 500,
    workerRecoveryInitialBackoffMs: 50,
    workerRecoveryMaxBackoffMs: 500,
    workerRecoveryMaxAttempts: 5,
    workerRecoveryCooldownMs: 2_000,
  } satisfies RenderWorkerPoolConfig

  return flyRenderWorkerPoolConfig
}

const runtimeServicesPromise: Promise<HonoRuntimeOptions['runtimeServices']> =
  renderWorkerPoolPromise.then((renderPool) => ({
    ssr: {
      renderPool,
    },
  }))

process.once('beforeExit', () => {
  console.log('Event loop emptied.')
})

process.on('exit', (code) => {
  console.log(`Process exits with code ${code}.`)
})

process.on('SIGCONT', () => {
  console.log(`Process ${process.pid} continues.`)
})

process.on('SIGUSR2', (signal) => {
  void shutdown(String(signal), signalExitCode(signal))
})

process.on('SIGINT', (signal) => {
  void shutdown(signal, signalExitCode(signal))
})

process.on('SIGTERM', (signal) => {
  void shutdown(signal, signalExitCode(signal))
})

process.on('unhandledRejection', (reason) => {
  runtimeMetrics.server.unhandledRejections++
  console.error(runtimeMetrics)
  console.error(reason)
})

process.on('uncaughtException', (error) => {
  try {
    fs.writeSync(process.stderr.fd, logHeading('error'))
    fs.writeSync(process.stderr.fd, errorToString(error))

    fs.writeSync(process.stderr.fd, logHeading('run context'))
    fs.writeSync(process.stderr.fd, objectToString(runtimeMetrics))

    if (DCE_BUILD_TARGET_ENVIRONMENT !== 'production') {
      fs.writeSync(process.stderr.fd, logHeading('env'))
      fs.writeSync(process.stderr.fd, objectToString(buildEnv))

      fs.writeSync(process.stderr.fd, logHeading('resources'))
      const resources = objectToString(resourceUsage())
      fs.writeSync(process.stderr.fd, resources)

      fs.writeSync(process.stderr.fd, logHeading('report'))
      const report = process.report.getReport(error)
      fs.writeSync(process.stderr.fd, JSON.stringify(report))
    }
  } finally {
    void shutdown('uncaughtException', 1).finally(() => {
      process.exit(1)
    })
  }
})

const server = await startServer()

async function startServer(): Promise<Bun.Server<undefined>> {
  try {
    validateRuntimeSecretEnv()
    await validateBuildEnvManifest()

    const runtimeServices = await runtimeServicesPromise
    const hono = createHono({
      runtimeMetrics,
      runtimeServices,
    })
    const server = Bun.serve({
      hostname: runEnv.RUN_HOST_INTERNAL,
      port: runEnv.RUN_PORT,
      fetch: hono.fetch,
    })
    console.log(`Server running at: ${server.url.toString()}`)

    runtimeMetrics.server.ssrReady = true
    runtimeMetrics.server.ready = true

    return server
  } catch (error) {
    console.error('Startup failed.', error)
    process.exit(1)
  }
}

async function shutdown(reason: string, code = 1) {
  if (runtimeMetrics.server.shutdownStarted) return
  runtimeMetrics.server.shutdownStarted = true
  runtimeMetrics.server.ready = false
  runtimeMetrics.server.ssrReady = false

  console.error(`Shutdown started by: ${reason}`)

  const forceExit = setTimeout(() => {
    console.error(`Forced shutdown after ${FORCE_EXIT_TIMEOUT}ms timeout.`)
    process.exit(1)
  }, FORCE_EXIT_TIMEOUT)

  try {
    await server.stop()

    if (runtimeMetrics.hono.inFlightRequests > 0) {
      const deadline = Date.now() + INFLIGHT_REQUESTS_TIMEOUT
      do {
        console.log(
          `Waiting for ${runtimeMetrics.hono.inFlightRequests} in-flight request(s).`,
        )
        await new Promise((resolve) => setTimeout(resolve, INFLIGHT_REQUESTS_POLL))
      } while (runtimeMetrics.hono.inFlightRequests > 0 && Date.now() < deadline)
      console.warn(
        `Exiting with ${runtimeMetrics.hono.inFlightRequests} in-flight request(s) still open.`,
      )
    }

    await closeRenderPool()

    clearTimeout(forceExit)
    console.log('Shutdown complete.')
    process.exit(code)
  } catch (error) {
    console.error('Error during shutdown.', error)
    process.exit(1)
  }
}

async function closeRenderPool(): Promise<void> {
  try {
    const runtimeServices = await runtimeServicesPromise
    await runtimeServices.ssr.renderPool.close()
  } catch (error) {
    console.error('Error during render worker pool shutdown.', error)
  }
}

function signalExitCode(signal: NodeJS.Signals) {
  return 128 + constants.signals[signal]
}
