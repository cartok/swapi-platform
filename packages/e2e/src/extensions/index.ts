import { mergeExpects, mergeTests } from '@playwright/test'

import { axeFixtures } from '#internal/extensions/axe/axe.fixtures'
import { axeMatchers } from '#internal/extensions/axe/axe.matchers'
import { consoleMonitoringFixtures } from '#internal/extensions/monitoring/console.fixtures'
import { exceptionMonitoringFixtures } from '#internal/extensions/monitoring/exception.fixtures'
import { requestMonitoringFixtures } from '#internal/extensions/monitoring/request.fixtures'

export const test = mergeTests(
  axeFixtures,
  consoleMonitoringFixtures,
  exceptionMonitoringFixtures,
  requestMonitoringFixtures,
)

export const expect = mergeExpects(axeMatchers)
