type ImportMetaEnvLike = {
  PROD?: boolean
}

type ImportMetaLike = ImportMeta & {
  env?: ImportMetaEnvLike
}

export function isProdEnvironment(): boolean {
  const viteProd = (import.meta as ImportMetaLike).env?.PROD === true
  const nodeEnv =
    typeof process !== 'undefined' ? process.env['NODE_ENV'] : undefined
  const bunEnv = typeof process !== 'undefined' ? process.env['BUN_ENV'] : undefined

  return viteProd || nodeEnv === 'production' || bunEnv === 'production'
}
