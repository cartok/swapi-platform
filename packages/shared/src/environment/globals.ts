type ParsedEnvValue = string | boolean | number
type ParsedEnv = Record<string, ParsedEnvValue>

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type OxcCompatibleParsedEnvValue = string | `"${string}"`
type OxcCompatibleParsedEnv = Record<string, OxcCompatibleParsedEnvValue>

export function envToOxcDefine(env: ParsedEnv): OxcCompatibleParsedEnv {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => {
      return [key, typeof value === 'string' ? `"${value}"` : `${value}`]
    }),
  )
}
