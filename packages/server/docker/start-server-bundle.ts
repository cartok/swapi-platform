import { existsSync } from 'node:fs'

import { buildEnv } from '@swapi/shared/environment/env'

const envFilePath = `./packages/server/.env/.env.${buildEnv.SWAPI_TARGET}.${buildEnv.SWAPI_PROFILE}`
const dockerEnvFilePath = `${envFilePath}.docker`
const serverEntryPath = './bundle-link/server.js'

assertFileExists(envFilePath)
assertFileExists(dockerEnvFilePath)
assertFileExists(serverEntryPath)

const serverProcess = Bun.spawn(
  [
    process.execPath,
    ...['--conditions', `@swapi/${buildEnv.SWAPI_TARGET}/${buildEnv.SWAPI_PROFILE}`],
    ...['--conditions', `@swapi/${buildEnv.SWAPI_PROFILE}`],
    // Bun applies later --env-file entries with higher priority.
    ...['--env-file', envFilePath],
    ...['--env-file', dockerEnvFilePath],
    serverEntryPath,
  ],
  {
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  },
)

const exitCode = await serverProcess.exited
process.exit(exitCode)

function assertFileExists(path: string): void {
  if (!existsSync(path)) {
    throw new Error(`Missing file: ${path}`)
  }
}
