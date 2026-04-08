import { resolve } from 'node:path'

import { env } from '#internal/env'

const serverPackageDir = resolve(env.SWAPI_SERVER_PACKAGE_DIR)

export const CLIENT_DIST_FOLDER = resolve(serverPackageDir, '../client/dist/browser')
export const INDEX_HTML = resolve(CLIENT_DIST_FOLDER, './index.html')
export const CLIENT_SSG_FOLDER = resolve(serverPackageDir, '../client/dist/ssg')
