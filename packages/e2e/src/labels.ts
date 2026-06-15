export const LABELS = {
  ARIA_SNAPSHOT: 'aria-snapshot',
  AXE: 'axe',
  REQUEST: 'request',
  SCREENSHOT: 'screenshot',
} as const satisfies Record<Uppercase<string>, Lowercase<string>>

export type Label = (typeof LABELS)[keyof typeof LABELS]
