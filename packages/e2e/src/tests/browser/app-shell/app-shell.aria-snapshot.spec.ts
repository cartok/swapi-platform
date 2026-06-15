import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'
import { testRegex } from '#internal/test-regex'

test.use({
  ...monitoringPresets.minimal,
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test(
  'aria',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.BROWSER, TAGS.APP_SHELL, TAGS.ARIA_SNAPSHOT] },
  async ({ page }) => {
    await expect(page.getByRole('banner')).toMatchAriaSnapshot(`
    - banner:
      - link "Go to home page"
      - navigation "Main Navigation":
        - link "Movies"
        - link "Characters"
        - link "Planets"
      - textbox ${testRegex.ariaSnapshot.text.singleLine}:
        - /placeholder: ${testRegex.ariaSnapshot.text.singleLine}
    `)

    await expect(page.getByRole('contentinfo')).toMatchAriaSnapshot(`
    - contentinfo:
      - paragraph:
        - text: ©
        - time: ${testRegex.ariaSnapshot.number.fourDigits}
        - text: ${testRegex.ariaSnapshot.text.singleLine}
    `)
  },
)
