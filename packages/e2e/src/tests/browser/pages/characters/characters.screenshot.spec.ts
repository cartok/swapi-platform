import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('characters')
})

test(
  'screenshots',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SCREENSHOT] },
  async ({ page }) => {
    const mainLocator = page.locator('main')
    await expect(mainLocator).toHaveScreenshot('characters-content.png', {
      mask: await mainLocator.locator('app-image').all(),
    })
  },
)
