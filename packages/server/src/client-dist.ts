import { resolve } from 'node:path'

import { env } from '#internal/env'

const serverPackageDir = resolve(env.SWAPI_SERVER_PACKAGE_DIR)
const clientDistRoot = resolve(
  serverPackageDir,
  '../client/dist',
  env.SWAPI_TARGET,
  env.SWAPI_OUTPUT_MODE,
)

export const CLIENT_DIST_FOLDER = resolve(clientDistRoot, 'browser')
export const INDEX_HTML = resolve(CLIENT_DIST_FOLDER, './index.html')
export const CLIENT_SSG_FOLDER = resolve(clientDistRoot, 'ssg')
