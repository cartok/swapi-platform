import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('planets')
})

test(
  'screenshots',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SCREENSHOT] },
  async ({ page }) => {
    const mainLocator = page.locator('main')
    await expect(page.locator('main')).toHaveScreenshot('planets-content.png', {
      mask: await mainLocator.locator('app-image').all(),
    })
  },
)
