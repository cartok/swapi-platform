import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'

test.use({
  ...monitoringPresets.full,
})

test('home', { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SMOKE] }, async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.locator('app-home')).toBeAttached()
})
