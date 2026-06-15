import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('')
})

test(
  'screenshots',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SCREENSHOT] },
  async ({ page }) => {
    await expect(page.locator('main')).toHaveScreenshot('home-content.png')
  },
)
