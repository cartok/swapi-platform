import { AxeBuilder } from '@axe-core/playwright'
import { test } from '@playwright/test'

import { issueResultTypes } from '#internal/extensions/axe/axe'

interface AxeFixtures {
  axe: () => AxeBuilder
}

type TagsParameter = Parameters<AxeBuilder['withTags']>[0]

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const satisfies TagsParameter

export const axeFixtures = test.extend<AxeFixtures>({
  axe: async ({ page }, use) => {
    const axeBuilderFactory = () =>
      new AxeBuilder({ page })
        .options({
          resultTypes: issueResultTypes,
        })
        .withTags(tags)

    await use(axeBuilderFactory)
  },
})
