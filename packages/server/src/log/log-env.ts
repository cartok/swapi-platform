import { logEnv } from '@swapi/shared/environment/env'

// These imports have to be relative for bundling.
import { buildEnv, runEnv, secretEnv } from '../env.js'

export function logServerEnv() {
  logEnv(buildEnv, { type: 'build time' })
  logEnv(runEnv, { type: 'runtime' })
}

export function logSystemEnv() {
  const buildEnvKeys = Object.keys(buildEnv)
  const runEnvKeys = Object.keys(runEnv)
  const secretEnvKeys = Object.keys(secretEnv)
  const keysToFilter: ReadonlySet<string> = new Set([
    ...buildEnvKeys,
    ...runEnvKeys,
    ...secretEnvKeys,
    'PATH',
  ])
  const systemEnv = Object.entries(process.env).reduce(
    (acc, [key, value]) => {
      if (keysToFilter.has(key)) {
        return acc
      } else {
        acc[key] = value
        return acc
      }
    },
    {} as Record<string, unknown>,
  )
  logEnv(systemEnv, { type: 'runtime', typeContext: 'of host system' })
}
// Environment Variables (build time) - visbile in browser
