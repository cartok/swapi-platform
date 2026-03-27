import { fileURLToPath } from 'node:url'

export const CLIENT_DIST_FOLDER_URL = new URL(
  '../../client/dist/browser/',
  import.meta.url,
)
export const CLIENT_DIST_FOLDER = fileURLToPath(CLIENT_DIST_FOLDER_URL)
export const INDEX_HTML = fileURLToPath(new URL('./index.html', CLIENT_DIST_FOLDER_URL))
