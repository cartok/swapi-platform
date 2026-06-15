import { expect, test } from '@playwright/test'

import type { RegExpOrString } from './monitoring.js'
import { matchesRegExpOrString } from './monitoring.js'

interface ExceptionMonitoringFixtures {
  exceptionMonitoring: boolean | ExceptionMonitoringConfig
  _autoExceptionMonitoring: void
}

export interface ExceptionMonitoringConfig {
  ignore?: RegExpOrString[]
}

const exceptionMonitoringDefaults: ExceptionMonitoringConfig = {}

export const exceptionMonitoringFixtures = test.extend<ExceptionMonitoringFixtures>({
  exceptionMonitoring: false,
  _autoExceptionMonitoring: [
    async ({ page, exceptionMonitoring }, use) => {
      if (!exceptionMonitoring) {
        await use()
        return
      }

      const config =
        exceptionMonitoring === true ? exceptionMonitoringDefaults : exceptionMonitoring

      const issues: string[] = []

      const onPageError = (error: Error) => {
        const text = `${error.message}\n${error.stack ?? ''}`

        if (matchesRegExpOrString(text, config.ignore)) {
          return
        }

        issues.push(`[page-error] ${text}`)
      }

      page.on('pageerror', onPageError)
      await use()
      page.off('pageerror', onPageError)

      expect(issues, issues.join('\n\n')).toHaveLength(0)
    },
    { auto: true },
  ],
})
