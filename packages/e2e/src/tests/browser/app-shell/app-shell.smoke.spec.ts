import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'

test.use({
  ...monitoringPresets.full,
})

test(
  'app shell',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.BROWSER, TAGS.APP_SHELL, TAGS.SMOKE] },
  async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBe(true)

    await expect(page.locator('app-header')).toBeAttached()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.locator('app-footer')).toBeAttached()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  },
)
