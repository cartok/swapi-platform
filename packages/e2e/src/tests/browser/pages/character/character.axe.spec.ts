import { expect, test } from '#internal/extensions/index'
import { TAGS } from '#internal/tags'

test.beforeEach(async ({ page }) => {
  await page.goto('/character/1')
})

test('axe', { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.AXE] }, async ({ axe }) => {
  const axeResults = await axe().include('main').analyze()
  expect(axeResults).toHaveNoAxeIssues()
})
