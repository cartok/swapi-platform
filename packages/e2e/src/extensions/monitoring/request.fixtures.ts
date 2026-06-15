import type { Request, Response } from '@playwright/test'
import { expect, test } from '@playwright/test'

import type { RegExpOrString } from './monitoring.js'
import { matchesRegExpOrString } from './monitoring.js'

interface RequestMonitoringFixtures {
  requestMonitoring: boolean | RequestMonitoringConfig
  _autoRequestMonitoring: void
}

export interface RequestMonitoringConfig {
  /**
   * Fails on technical network failures, e.g. net::ERR_FAILED,
   * aborted requests, connection errors, DNS errors.
   *
   * Note: HTTP 404/500 responses do not trigger requestfailed.
   */
  failOnRequestFailed?: boolean
  /**
   * Fails on HTTP responses with status >= threshold.
   */
  failOnHttpStatusCode?: {
    threshold: number
    ignore?: number[]
  }
  ignoreUrls?: RegExpOrString[]
}

const requestMonitoringDefaults: RequestMonitoringConfig = {
  failOnRequestFailed: true,
  failOnHttpStatusCode: {
    threshold: 400,
  },
}

export const requestMonitoringFixtures = test.extend<RequestMonitoringFixtures>({
  requestMonitoring: false,
  _autoRequestMonitoring: [
    async ({ page, requestMonitoring }, use) => {
      if (!requestMonitoring) {
        await use()
        return
      }

      const config =
        requestMonitoring === true ? requestMonitoringDefaults : requestMonitoring

      const issues: string[] = []

      const onRequestFailed = (request: Request) => {
        if (!config.failOnRequestFailed) {
          return
        }

        const url = request.url()

        if (matchesRegExpOrString(url, config.ignoreUrls)) {
          return
        }

        issues.push(
          [
            '[request-failed]',
            request.method(),
            url,
            `resource=${request.resourceType()}`,
            !request.failure()?.errorText
              ? null
              : `failure=${request.failure()?.errorText}`,
          ]
            .filter(Boolean)
            .join(' '),
        )
      }

      const onResponse = (response: Response) => {
        if (!config.failOnHttpStatusCode) {
          return
        }

        const status = response.status()
        const url = response.url()

        if (matchesRegExpOrString(url, config.ignoreUrls)) {
          return
        }

        if (status < config.failOnHttpStatusCode.threshold) {
          return
        }

        if (config.failOnHttpStatusCode.ignore?.includes(status)) {
          return
        }

        issues.push(['[http-error]', status, response.statusText(), url].join(' '))
      }

      page.on('requestfailed', onRequestFailed)
      page.on('response', onResponse)
      await use()
      page.off('requestfailed', onRequestFailed)
      page.off('response', onResponse)

      expect(issues, issues.join('\n')).toHaveLength(0)
    },
    { auto: true },
  ],
})
