import type { ConsoleMonitoringConfig } from '#internal/extensions/monitoring/console.fixtures'
import type { ExceptionMonitoringConfig } from '#internal/extensions/monitoring/exception.fixtures'
import type { RequestMonitoringConfig } from '#internal/extensions/monitoring/request.fixtures'

export const monitoringPresets = {
  minimal: {
    consoleMonitoring: false,
    exceptionMonitoring: true,
    requestMonitoring: false,
  },
  full: {
    consoleMonitoring: true,
    exceptionMonitoring: true,
    requestMonitoring: true,
  },
  /**
   * The strict preset fails right now due to harmless warnings.
   * It could be used at a later stage.
   */
  strict: {
    consoleMonitoring: {
      failOnTypes: ['assert', 'error', 'warning'],
    },
    exceptionMonitoring: true,
    requestMonitoring: true,
  },
  /**
   * Preset for request tests (no browser).
   */
  request: {
    consoleMonitoring: false,
    exceptionMonitoring: true,
    requestMonitoring: true,
  },
} satisfies Record<
  string,
  {
    consoleMonitoring?: boolean | ConsoleMonitoringConfig
    exceptionMonitoring?: boolean | ExceptionMonitoringConfig
    requestMonitoring?: boolean | RequestMonitoringConfig
  }
>

export type RegExpOrString = RegExp | string

export function matchesRegExpOrString(
  value: string,
  patterns: RegExpOrString[] = [],
): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string' ? value.includes(pattern) : pattern.test(value),
  )
}
