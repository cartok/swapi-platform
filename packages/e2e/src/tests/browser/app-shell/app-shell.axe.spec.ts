import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test(
  'axe',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.BROWSER, TAGS.APP_SHELL, TAGS.AXE] },
  async ({ axe }) => {
    const axeResults = await axe().include('app-header').include('app-footer').analyze()
    expect(axeResults).toHaveNoAxeIssues()
  },
)
