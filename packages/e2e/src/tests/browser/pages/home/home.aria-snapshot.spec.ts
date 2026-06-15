import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'

test.use({
  ...monitoringPresets.minimal,
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('aria', { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.ARIA_SNAPSHOT] }, async ({ page }) => {
  await expect(page.locator('app-home')).toMatchAriaSnapshot(
    `- heading "Star Wars (Logo)" [level=1]`,
  )
})
