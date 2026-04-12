import { existsSync, symlinkSync } from 'node:fs'

import { buildEnv } from '@swapi/shared/environment/env'

const bundleDirectory = `./packages/server/dist/${buildEnv.SWAPI_TARGET}/${buildEnv.SWAPI_PROFILE}/bundle`
const symlinkPath = './bundle-link'

if (!existsSync(bundleDirectory)) {
  throw new Error(`Bundle directory does not exist: ${bundleDirectory}`)
}

if (existsSync(symlinkPath)) {
  throw new Error(`Path already exists and cannot be linked: ${symlinkPath}`)
}

symlinkSync(bundleDirectory, symlinkPath)
