import type { ConsoleMessage } from '@playwright/test'
import { expect, test } from '@playwright/test'
import type { NonEmptyArray } from '@swapi/shared/types/shared.types'

import type { RegExpOrString } from './monitoring.js'
import { matchesRegExpOrString } from './monitoring.js'

interface ConsoleMonitoringFixtures {
  consoleMonitoring: boolean | ConsoleMonitoringConfig
  _autoConsoleMonitoring: void
}

export interface ConsoleMonitoringConfig {
  failOnTypes: NonEmptyArray<FailOnType>
  ignore?: RegExpOrString[]
}

type FailOnType = Extract<ConsoleMessageType, 'error' | 'warning' | 'assert'>

type ConsoleMessageType = ReturnType<ConsoleMessage['type']>

const consoleMonitoringDefaults: ConsoleMonitoringConfig = {
  failOnTypes: ['assert', 'error'],
}

export const consoleMonitoringFixtures = test.extend<ConsoleMonitoringFixtures>({
  consoleMonitoring: false,
  _autoConsoleMonitoring: [
    async ({ page, consoleMonitoring }, use) => {
      if (!consoleMonitoring) {
        await use()
        return
      }

      const config =
        consoleMonitoring === true ? consoleMonitoringDefaults : consoleMonitoring
      const failOnTypes = new Set<FailOnType>(config.failOnTypes)

      const issues: string[] = []

      const onConsole = (message: ConsoleMessage) => {
        const type = message.type() as FailOnType

        if (!failOnTypes.has(type)) {
          return
        }

        const text = message.text()

        if (matchesRegExpOrString(text, config.ignore)) {
          return
        }

        const location = message.location()
        const locationText = !location.url
          ? 'unknown location'
          : `${location.url}:${location.lineNumber}:${location.columnNumber}`

        issues.push(`[console.${type}] ${text} at ${locationText}.`)
      }

      page.on('console', onConsole)
      await use()
      page.off('console', onConsole)

      expect(issues, issues.join('\n')).toHaveLength(0)
    },
    { auto: true },
  ],
})
