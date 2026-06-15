import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('movies')
})

test(
  'screenshots',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SCREENSHOT] },
  async ({ page }) => {
    const mainLocator = page.locator('main')
    await expect(page.locator('main')).toHaveScreenshot('movies-content.png', {
      mask: await mainLocator.locator('app-image').all(),
    })
  },
)
