import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('movie/1')
})

test(
  'screenshots',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.SCREENSHOT] },
  async ({ page }) => {
    const mainLocator = page.locator('main')
    await expect(mainLocator).toHaveScreenshot('movie-content.png', {
      mask: [
        ...(await mainLocator.locator('app-image').all()),
        ...(await mainLocator.locator('app-link-list').all()),
      ],
    })
  },
)
