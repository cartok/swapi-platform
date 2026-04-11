import { existsSync, symlinkSync } from 'node:fs'

import { parseBuildEnv } from '@swapi/shared/environment/env'

const env = parseBuildEnv()

const bundleDirectory = `./packages/server/dist/${env.SWAPI_TARGET}/${env.SWAPI_OUTPUT_MODE}/bundle`
const symlinkPath = './bundle-link'

if (!existsSync(bundleDirectory)) {
  throw new Error(`Bundle directory does not exist: ${bundleDirectory}`)
}

if (existsSync(symlinkPath)) {
  throw new Error(`Path already exists and cannot be linked: ${symlinkPath}`)
}

symlinkSync(bundleDirectory, symlinkPath)
