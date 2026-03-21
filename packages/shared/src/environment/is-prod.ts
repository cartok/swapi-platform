type ImportMetaWithEnv = ImportMeta & {
  env?: {
    PROD?: boolean
  }
}

export function isProdEnvironment(): boolean {
  const viteProd = (import.meta as ImportMetaWithEnv).env?.PROD === true
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env
  const nodeEnv = env?.['NODE_ENV']
  const bunEnv = env?.['BUN_ENV']

  return viteProd || nodeEnv === 'production' || bunEnv === 'production'
}
