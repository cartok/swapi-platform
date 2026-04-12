import { existsSync } from 'node:fs'

import { buildEnv } from '@swapi/shared/environment/env'

const outputEnvFilePath = `./packages/server/.env/.env.output.${buildEnv.SWAPI_OUTPUT_MODE}`
const targetEnvFilePath = `./packages/server/.env/.env.target.${buildEnv.SWAPI_TARGET}`
const serverEntryPath = './bundle-link/server.js'

assertFileExists(outputEnvFilePath)
assertFileExists(targetEnvFilePath)
assertFileExists(serverEntryPath)

const serverProcess = Bun.spawn(
  [
    process.execPath,
    ...['--conditions', `@swapi/${buildEnv.SWAPI_TARGET}/${buildEnv.SWAPI_OUTPUT_MODE}`],
    ...['--conditions', `@swapi/${buildEnv.SWAPI_OUTPUT_MODE}`],
    ...['--env-file', outputEnvFilePath],
    ...['--env-file', targetEnvFilePath],
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
