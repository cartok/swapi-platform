import type { HeadersInit } from 'bun'

import { DCE_BUILD_TARGET_ENVIRONMENT, runEnv } from '#internal/env'

// The timeout should be lower than the one defined in fly config for that health check.
const SSR_SMOKE_TEST_TIMEOUT_MS = 2000

export async function runSsrSmokeTest(): Promise<void> {
  console.log('Running SSR Smoke Test.')

  const url = new URL(`http://${runEnv.RUN_HOST}:${runEnv.RUN_PORT}`)
  const acceptedContentType = 'text/html'
  const headers: HeadersInit = {
    Accept: acceptedContentType,
    Host: runEnv.RUN_HOST,
    'X-Skip-SSG': 'true',
  }

  if (DCE_BUILD_TARGET_ENVIRONMENT !== 'local') {
    headers['X-Forwarded-Proto'] = 'https'
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    signal: AbortSignal.timeout(SSR_SMOKE_TEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(
      `SSR Smoke Test failed for ${url.pathname} with status ${response.status}.`,
    )
  }

  const contentType = response.headers.get('Content-Type')?.toLowerCase()
  if (!contentType?.includes('text/html')) {
    throw new Error(
      `SSR Smoke Test failed for ${url.pathname}: ` +
        `expected ${acceptedContentType} but got ${contentType ?? 'empty content-type'}.`,
    )
  }

  await response.arrayBuffer()
  console.log('SSR Smoke Test was sucessfull.')
}
