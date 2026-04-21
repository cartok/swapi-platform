import fs from 'node:fs'
import process, { resourceUsage } from 'node:process'

import { PATHS } from '@swapi/shared/routing/paths'

import { env } from '#internal/env'
import { createHono } from '#internal/hono'
import { header, objectToString } from '#internal/log'
import { honoFetchWithForwardedProtocol } from '#internal/security/forwarded-headers'
import { warmupSsrRenderEngine } from '#internal/ssr/ssr.handler'
import type { ServerRunContext } from '#internal/types'

console.log(`Process id is: ${process.pid}`)

// Fly kills in 8 seconds, see `kill_timeout` in fly.toml.
const FORCE_EXIT_TIMEOUT = 7_500
const INFLIGHT_REQUESTS_TIMEOUT = 6_000
const INFLIGHT_REQUESTS_POLL = 100
const SSR_SMOKE_TEST_PATH = PATHS.SSR.MOVIES

const runContext: ServerRunContext = {
  ready: false,
  ssrReady: false,
  shutdownStarted: false,
  unhandledRejectionCount: 0,
  inFlightRequests: 0,
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
  void shutdown(String(signal), 0)
})

process.on('SIGINT', (signal) => {
  void shutdown(signal, 0)
})

process.on('SIGTERM', (signal) => {
  void shutdown(signal, 1)
})

process.on('unhandledRejection', (reason) => {
  runContext.unhandledRejectionCount++
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

  try {
    await warmupSsrRenderEngine()
    await runSsrSmokeTest()

    runContext.ssrReady = true
    runContext.ready = true

    return server
  } catch (error) {
    console.error('Startup failed.', error)
    await server.stop(true)
    process.exit(1)
  }
}

async function runSsrSmokeTest(): Promise<void> {
  console.log('Running SSR Smoke Test.')
  const smokeTestUrl = new URL(
    SSR_SMOKE_TEST_PATH,
    `http://127.0.0.1:${String(env.SWAPI_SERVER_PORT)}`,
  )
  const smokeTestHeaders: Record<string, string> = {
    accept: 'text/html',
    host: env.SWAPI_SERVER_HOST,
  }

  if (env.SWAPI_TARGET !== 'local') {
    smokeTestHeaders['x-forwarded-proto'] = 'https'
  }

  const response = await fetch(smokeTestUrl, {
    method: 'GET',
    headers: smokeTestHeaders,
  })

  if (!response.ok) {
    throw new Error(
      `SSR smoke test failed for ${smokeTestUrl.pathname} with status ${response.status}.`,
    )
  }

  const contentType = response.headers.get('content-type')?.toLowerCase()
  if (!contentType?.includes('text/html')) {
    throw new Error(
      `SSR smoke test failed for ${smokeTestUrl.pathname}: ` +
        `expected text/html but got ${contentType ?? 'empty content-type'}.`,
    )
  }

  await response.arrayBuffer()
  console.log('SSR Smoke Test was sucessfull.')
}

async function shutdown(reason: string, code = 0) {
  if (runContext.shutdownStarted) return
  runContext.shutdownStarted = true
  runContext.ready = false
  runContext.ssrReady = false

  console.error(`Shutdown started by: ${reason}`)

  const forceExitTimer = setTimeout(() => {
    console.error(`Forced shutdown after ${FORCE_EXIT_TIMEOUT}ms timeout.`)
    void server.stop(true)
    process.exit(1)
  }, FORCE_EXIT_TIMEOUT)

  try {
    await server.stop()

    if (runContext.inFlightRequests > 0) {
      const deadline = Date.now() + INFLIGHT_REQUESTS_TIMEOUT

      do {
        console.log(`Waiting for ${runContext.inFlightRequests} in-flight request(s).`)
        await new Promise((resolve) => setTimeout(resolve, INFLIGHT_REQUESTS_POLL))
      } while (runContext.inFlightRequests > 0 && Date.now() < deadline)

      console.warn(
        `Exiting with ${runContext.inFlightRequests} in-flight request(s) still open.`,
      )
    }

    clearTimeout(forceExitTimer)
    console.log('Shutdown complete.')
    process.exit(code)
  } catch (error) {
    console.error('Error during shutdown.', error)
    process.exit(1)
  }
}
