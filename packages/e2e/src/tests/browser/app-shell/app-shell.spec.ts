import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'
import { testRegex } from '#internal/test-regex'

test.use({
  ...monitoringPresets.full,
})

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe(
  'features',
  { tag: [TAGS.BROWSER, TAGS.PAGE, TAGS.BROWSER, TAGS.APP_SHELL] },
  () => {
    test('header navigation links route to primary pages', async ({ page }) => {
      const navigation = page.getByRole('navigation', { name: 'Main Navigation' })

      await expect(navigation.getByRole('link', { name: 'Movies' })).toHaveAttribute(
        'href',
        '/movies',
      )
      await expect(navigation.getByRole('link', { name: 'Characters' })).toHaveAttribute(
        'href',
        '/characters',
      )
      await expect(navigation.getByRole('link', { name: 'Planets' })).toHaveAttribute(
        'href',
        '/planets',
      )
    })

    test('header exposes home link and search field', async ({ page }) => {
      const header = page.getByRole('banner')

      await expect(header.getByRole('link', { name: 'Go to home page' })).toHaveAttribute(
        'href',
        '/',
      )
      await expect(
        header.getByRole('textbox', {
          name: 'This is only UI that has no functionality',
        }),
      ).toHaveAttribute('placeholder', testRegex.text.singleLine)
    })

    test('footer exposes copyright information', async ({ page }) => {
      const footer = page.getByRole('contentinfo')

      await expect(footer.getByText('Company, Inc.')).toBeVisible()
      await expect(footer.locator('time')).toHaveAttribute(
        'datetime',
        testRegex.number.fourDigits,
      )
    })
  },
)
