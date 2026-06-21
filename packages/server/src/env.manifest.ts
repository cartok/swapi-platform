import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { isRecord } from '@swapi/shared/types/guards'

// These imports have to be relative for bundling.
import { buildEnv, DCE_BUILD_TARGET_ENVIRONMENT } from './env.js'

export const BUILD_ENV_MANIFEST_FILE_NAME = 'env.manifest.json'

const BUILD_ENV_MANIFEST_PATH = fileURLToPath(
  new URL(`./${BUILD_ENV_MANIFEST_FILE_NAME}`, import.meta.url),
)

export async function validateBuildEnvManifest(manifestPath = BUILD_ENV_MANIFEST_PATH) {
  const buildEnvManifest: unknown = JSON.parse(await readFile(manifestPath, 'utf8'))
  const buildEnvUntyped = buildEnv as Record<string, unknown>

  assert(isRecord(buildEnvManifest))

  const errorMessages = [
    ...findInvalidBuildEnvManifestEntries(buildEnvManifest, buildEnvUntyped),
    ...findUnexpectedBuildEnvEntries(buildEnvManifest, buildEnvUntyped),
  ]

  if (errorMessages.length) {
    const banner = [
      `Build environment variables are invalid.`,
      `Ensure to run the application with the same build environment variables`,
      `it was built with.`,
    ].join(' ')

    throw new Error([banner, '', `Details:`, ...errorMessages].join('\n'))
  }
}

function findInvalidBuildEnvManifestEntries(
  buildEnvManifest: Record<string, unknown>,
  buildEnvUntyped: Record<string, unknown>,
): string[] {
  return Object.entries(buildEnvManifest).flatMap(([manifestKey, manifestValue]) => {
    if (!(manifestKey in buildEnvUntyped)) {
      return [`Key ${manifestKey} is missing.`]
    }

    const actualValue = buildEnvUntyped[manifestKey]

    if (
      DCE_BUILD_TARGET_ENVIRONMENT === 'local' &&
      manifestKey === 'BUILD_GIT_COMMIT_SHA'
    ) {
      return []
    }

    if (actualValue !== manifestValue) {
      return [
        `Value of ${manifestKey} is invalid.`,
        `Expected: ${JSON.stringify(manifestValue)}`,
        `Actual: ${JSON.stringify(actualValue)}`,
      ]
    }

    return []
  })
}

function findUnexpectedBuildEnvEntries(
  buildEnvManifest: Record<string, unknown>,
  buildEnvUntyped: Record<string, unknown>,
): string[] {
  return Object.keys(buildEnvUntyped).flatMap((buildEnvKey) => {
    if (buildEnvKey in buildEnvManifest) {
      return []
    }

    return [`Key ${buildEnvKey} is unexpected.`]
  })
}
