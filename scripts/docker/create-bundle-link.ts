import { existsSync, symlinkSync } from 'node:fs'

const target = process.env['SWAPI_TARGET']
const outputMode = process.env['SWAPI_OUTPUT_MODE']

if (!target) {
  throw new Error('SWAPI_TARGET is not set')
}

if (!outputMode) {
  throw new Error('SWAPI_OUTPUT_MODE is not set')
}

const bundleDirectory = `./packages/server/dist/${target}/${outputMode}/bundle`
const symlinkPath = './bundle-link'

if (!existsSync(bundleDirectory)) {
  throw new Error(`Bundle directory does not exist: ${bundleDirectory}`)
}

if (existsSync(symlinkPath)) {
  throw new Error(`Path already exists and cannot be linked: ${symlinkPath}`)
}

symlinkSync(bundleDirectory, symlinkPath)
