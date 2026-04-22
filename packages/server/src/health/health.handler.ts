import { env, secretEnv } from '#internal/env'
import type { Handler } from '#internal/types'

// Timeout should be below the timeout configured in fly.toml.
const SSR_SMOKE_TEST_TIMEOUT_MS = 2000

export const addHealthChecksHandler: Handler = (hono, runContext) => {
  if (env.SWAPI_TARGET !== 'local') {
    hono.on(['GET', 'HEAD'], '/status/*', async (c, next) => {
      if (
        !secretEnv.SWAPI_SECRET_HEALTH_CHECK_TOKEN ||
        secretEnv.SWAPI_SECRET_HEALTH_CHECK_TOKEN !==
          c.req.header('X-Secret-Health-Check-Token')
      ) {
        return c.text('Forbidden', 400)
      }

      return next()
    })
  }

  hono.get('/status/alife', (c) => {
    return c.body(null, runContext.server.shutdownStarted ? 503 : 200)
  })

  hono.get('/status/ready', (c) => {
    return c.body(
      null,
      !runContext.server.ready ||
        !runContext.server.ssrReady ||
        runContext.server.shutdownStarted
        ? 503
        : 200,
    )
  })

  hono.get('/status/ssr', async (c) => {
    try {
      await runSsrSmokeTest()
      return c.body(null, 200)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Unexpected error during SSR Smoke Test.')
      } else {
        console.error(error)
      }
      return c.body(null, 503)
    }
  })

  hono.get('/status/errors', (c) => {
    if (!runContext.server.unhandledRejections && !runContext.hono.caughtExceptions) {
      return c.body(null, 200)
    } else {
      const text = [
        `Unhandled Promise Rejections: ${runContext.server.unhandledRejections}`,
        `Unhandled Exceptions: ${runContext.hono.caughtExceptions}`,
      ].join(', ')
      return c.text(text, 503)
    }
  })
}

async function runSsrSmokeTest(): Promise<void> {
  console.log('Running SSR Smoke Test.')
  const smokeTestUrl = new URL(`http://127.0.0.1:${env.SWAPI_SERVER_PORT}`)
  const smokeTestHeaders: HeadersInit = {
    Accept: 'text/html',
    Host: env.SWAPI_SERVER_HOST,
    'X-Skip-Device-Detection': 'true',
    'X-Skip-SSG': 'true',
  }

  if (env.SWAPI_TARGET !== 'local') {
    smokeTestHeaders['X-Forwarded-Proto'] = 'https'
  }

  const response = await fetch(smokeTestUrl, {
    method: 'GET',
    headers: smokeTestHeaders,
    signal: AbortSignal.timeout(SSR_SMOKE_TEST_TIMEOUT_MS),
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
