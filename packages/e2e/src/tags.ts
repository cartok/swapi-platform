import { FLAGS } from '#internal/flags'
import { LABELS } from '#internal/labels'

type Tag = `@${Lowercase<string>}`

export const TAGS = {
  APP_SHELL: '@app-shell',
  ARIA_SNAPSHOT: `@${LABELS.ARIA_SNAPSHOT}`,
  AXE: `@${LABELS.AXE}`,
  BROWSER: `@browser`,
  COMPONENT: '@component',
  LAYOUT: '@layout',
  PAGE: '@page',
  REQUEST: `@${LABELS.REQUEST}`,
  SCREENSHOT: `@${LABELS.SCREENSHOT}`,
  SMOKE: `@${FLAGS.SMOKE}`,
  WORKER: '@worker',
} as const satisfies Record<keyof typeof LABELS, Tag> &
  Record<keyof typeof FLAGS, Tag> &
  Record<string, Tag>
