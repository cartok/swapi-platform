import { fileURLToPath } from 'node:url'

export const CLIENT_DIST_FOLDER_URL = new URL(
  '../../client/dist/browser/',
  import.meta.url,
)
export const CLIENT_DIST_FOLDER = fileURLToPath(CLIENT_DIST_FOLDER_URL)
export const INDEX_HTML = fileURLToPath(new URL('./index.html', CLIENT_DIST_FOLDER_URL))

export const CLIENT_SSG_FOLDER_URL = new URL('../../client/dist/ssg/', import.meta.url)
export const CLIENT_SSG_FOLDER = fileURLToPath(CLIENT_SSG_FOLDER_URL)
