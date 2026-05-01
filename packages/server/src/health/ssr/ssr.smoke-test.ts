import { env, GLOBAL_SWAPI_TARGET } from '#internal/env'

// The timeout should be lower than the one defined in fly config for that health check.
const SSR_SMOKE_TEST_TIMEOUT_MS = 2000
const SSR_SMOKE_TEST_URL = new URL(`http://127.0.0.1:${env.SWAPI_SERVER_PORT}`)

export async function runSsrSmokeTest(): Promise<void> {
  console.log('Running SSR Smoke Test.')
  const acceptedContentType = 'text/html'
  const headers: HeadersInit = {
    Accept: acceptedContentType,
    Host: env.SWAPI_SERVER_HOST,
    'X-Skip-Device-Detection': 'true',
    'X-Skip-SSG': 'true',
  }

  if (GLOBAL_SWAPI_TARGET !== 'local') {
    headers['X-Forwarded-Proto'] = 'https'
  }

  const response = await fetch(SSR_SMOKE_TEST_URL, {
    method: 'GET',
    headers: headers,
    signal: AbortSignal.timeout(SSR_SMOKE_TEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(
      `SSR Smoke Test failed for ${SSR_SMOKE_TEST_URL.pathname} with status ${response.status}.`,
    )
  }

  const contentType = response.headers.get('Content-Type')?.toLowerCase()
  if (!contentType?.includes('text/html')) {
    throw new Error(
      `SSR Smoke Test failed for ${SSR_SMOKE_TEST_URL.pathname}: ` +
        `expected ${acceptedContentType} but got ${contentType ?? 'empty content-type'}.`,
    )
  }

  await response.arrayBuffer()
  console.log('SSR Smoke Test was sucessfull.')
}
