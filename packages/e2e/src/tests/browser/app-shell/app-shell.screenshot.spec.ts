import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test(
  'screenshots',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.BROWSER, TAGS.APP_SHELL, TAGS.SCREENSHOT] },
  async ({ page }) => {
    await expect(page.locator('app-header')).toHaveScreenshot('app-shell-header.png')
    await expect(page.locator('app-footer')).toHaveScreenshot('app-shell-footer.png')
  },
)
