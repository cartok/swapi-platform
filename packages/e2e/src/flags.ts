export const FLAGS = {
  SMOKE: 'smoke',
} as const satisfies Record<Uppercase<string>, Lowercase<string>>

export type Flag = (typeof FLAGS)[keyof typeof FLAGS]
