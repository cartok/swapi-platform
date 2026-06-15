import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'

test.use({
  ...monitoringPresets.full,
})

test('planets', { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SMOKE] }, async ({ page }) => {
  const response = await page.goto('/planets')
  expect(response?.ok()).toBe(true)
  await expect(page.locator('app-planets')).toBeAttached()
})
