import { SWAPI_BASE_URL_STRING } from '@swapi/shared/apis/external/urls'

import { runTlsCertificateHealthCheck } from '#internal/health/tls-certificate.health-check'

// The timeout should be lower than the one defined in fly config for that health check.
const SWAPI_API_HEALTH_CHECK_TIMEOUT_MS = 2000
const SWAPI_API_HEALTH_CHECK_URL = new URL(SWAPI_BASE_URL_STRING)

export async function runSwapiApiSmokeTest(): Promise<void> {
  console.log('Running SWAPI API Smoke Test.')
  await runTlsCertificateHealthCheck({
    host: SWAPI_API_HEALTH_CHECK_URL.hostname,
  })

  const acceptedContentType = 'application/json'
  const response = await fetch(SWAPI_API_HEALTH_CHECK_URL, {
    method: 'GET',
    headers: {
      Accept: acceptedContentType,
    },
    signal: AbortSignal.timeout(SWAPI_API_HEALTH_CHECK_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(
      `SWAPI API Smoke Test failed for ${SWAPI_API_HEALTH_CHECK_URL.pathname} with status ${response.status}.`,
    )
  }

  const contentType = response.headers.get('Content-Type')?.toLowerCase()
  if (!contentType?.includes('application/json')) {
    throw new Error(
      `SWAPI API Smoke Test failed for ${SWAPI_API_HEALTH_CHECK_URL.toString()}: ` +
        `expected ${acceptedContentType} but got ${contentType ?? 'empty content-type'}.`,
    )
  }

  await response.json()
  console.log('SWAPI Smoke Test check was sucessfull.')
}
