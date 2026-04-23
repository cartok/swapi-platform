import fs from 'node:fs'
import { constants } from 'node:os'
import process, { resourceUsage } from 'node:process'

import { header, objectToString } from '@swapi/shared/logging/utils'

import { env } from '#internal/env'
import { createHono } from '#internal/hono'
import { honoFetchWithForwardedProtocol } from '#internal/security/forwarded-headers'
import { warmupSsrRenderEngine } from '#internal/ssr/ssr.handler'
import type { ServerRunContext } from '#internal/types'

console.log(`Process id is: ${process.pid}`)

// The timeout should be lower than the one defined in fly config for that health check.
const FORCE_EXIT_TIMEOUT = 7_500
const INFLIGHT_REQUESTS_TIMEOUT = 6_000
const INFLIGHT_REQUESTS_POLL = 100

const runContext: ServerRunContext = {
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
}

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
  runContext.server.unhandledRejections++
  console.error(runContext)
  console.error(reason)
})

process.on('uncaughtException', (error) => {
  try {
    const errorMessage = (error.stack ?? `${error.name}: ${error.message}`) + '\n'
    fs.writeSync(process.stderr.fd, header('error'))
    fs.writeSync(process.stderr.fd, errorMessage)

    fs.writeSync(process.stderr.fd, header('run context'))
    fs.writeSync(process.stderr.fd, objectToString(runContext))

    if (env.SWAPI_TARGET !== 'production') {
      fs.writeSync(process.stderr.fd, header('env'))
      fs.writeSync(process.stderr.fd, objectToString(env))

      fs.writeSync(process.stderr.fd, header('resources'))
      const resources = objectToString(resourceUsage())
      fs.writeSync(process.stderr.fd, resources)

      fs.writeSync(process.stderr.fd, header('report'))
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
    const hono = createHono(runContext)
    const server = Bun.serve({
      hostname: env.SWAPI_SERVER_HOST_INTERNAL,
      port: env.SWAPI_SERVER_PORT,
      fetch:
        env.SWAPI_TARGET === 'local'
          ? hono.fetch
          : honoFetchWithForwardedProtocol(hono, runContext),
    })
    console.log(`Server running at: ${server.url}`)

    await warmupSsrRenderEngine()
    runContext.server.ssrReady = true
    runContext.server.ready = true

    return server
  } catch (error) {
    console.error('Startup failed.', error)
    process.exit(1)
  }
}
async function shutdown(reason: string, code = 1) {
  if (runContext.server.shutdownStarted) return
  console.error(`Shutdown started by: ${reason}`)

  runContext.server.shutdownStarted = true
  runContext.server.ready = false
  runContext.server.ssrReady = false

  const forceExit = setTimeout(() => {
    console.error(`Forced shutdown after ${FORCE_EXIT_TIMEOUT}ms timeout.`)
    process.exit(1)
  }, FORCE_EXIT_TIMEOUT)

  try {
    await server.stop()
    if (runContext.hono.inFlightRequests > 0) {
      const deadline = Date.now() + INFLIGHT_REQUESTS_TIMEOUT
      do {
        console.log(
          `Waiting for ${runContext.hono.inFlightRequests} in-flight request(s).`,
        )
        await new Promise((resolve) => setTimeout(resolve, INFLIGHT_REQUESTS_POLL))
      } while (runContext.hono.inFlightRequests > 0 && Date.now() < deadline)
      console.warn(
        `Exiting with ${runContext.hono.inFlightRequests} in-flight request(s) still open.`,
      )
    }

    clearTimeout(forceExit)
    console.log('Shutdown complete.')
    process.exit(code)
  } catch (error) {
    console.error('Error during shutdown.', error)
    process.exit(1)
  }
}

function signalExitCode(signal: NodeJS.Signals) {
  return 128 + constants.signals[signal]
}
