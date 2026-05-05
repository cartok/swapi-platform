import fs from 'node:fs'
import { availableParallelism, constants } from 'node:os'
import process, { resourceUsage } from 'node:process'

import { errorToString, logHeading, objectToString } from '@swapi/shared/log/log'

import { env, GLOBAL_SWAPI_TARGET } from '#internal/env'
import { createHono } from '#internal/hono'
import { RenderWorkerPool } from '#internal/ssr/render-worker-pool'
import type { ServerRuntimeMetrics, ServerRuntimeServices } from '#internal/types'

console.info(`Process id is: ${process.pid}`)
if (GLOBAL_SWAPI_TARGET !== 'local') {
  console.info('Environment', process.env)
}

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

const poolSize = Math.max(1, availableParallelism() - 1)
const renderPoolPromise = RenderWorkerPool.create({
  workerFile: resolveRenderWorkerFile(),
  workerCount: poolSize,
  maxQueuedJobs: 6,
  queueTimeoutMs: 250,
  renderAbortTimeoutMs: 1_500,
  requestAbortWorkerGraceMs: 500,
  renderTimeoutWorkerGraceMs: 500,
  workerRecoveryInitialBackoffMs: 50,
  workerRecoveryMaxBackoffMs: 500,
  workerRecoveryMaxAttempts: 5,
  workerRecoveryCooldownMs: 2_000,
  metrics: runtimeMetrics.ssrWorkerPool,
})

const runtimeServicesPromise: Promise<ServerRuntimeServices> = renderPoolPromise.then(
  (renderPool) => ({
    ssr: {
      renderPool,
    },
  }),
)

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

    if (GLOBAL_SWAPI_TARGET !== 'production') {
      fs.writeSync(process.stderr.fd, logHeading('env'))
      fs.writeSync(process.stderr.fd, objectToString(env))

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
    const runtimeServices = await runtimeServicesPromise
    const hono = createHono(runtimeMetrics, runtimeServices)
    const server = Bun.serve({
      hostname: env.SWAPI_SERVER_HOST_INTERNAL,
      port: env.SWAPI_SERVER_PORT,
      fetch: hono.fetch,
    })
    console.log(`Server running at: ${server.url}`)

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
  console.error(`Shutdown started by: ${reason}`)

  runtimeMetrics.server.shutdownStarted = true
  runtimeMetrics.server.ready = false
  runtimeMetrics.server.ssrReady = false

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

function resolveRenderWorkerFile(): URL {
  const renderWorkerFileName =
    process.env['SWAPI_SSR_WORKER_VARIANT'] === 'jit'
      ? 'render-worker.jit.js'
      : 'render-worker.js'

  return new URL(`./ssr/${renderWorkerFileName}`, import.meta.url)
}
