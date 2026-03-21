import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createExpressServer } from '@/server'

const serverEntryFolder = dirname(fileURLToPath(import.meta.url))
// TODO: Das ist noch Müll.
const clientDistFolder =
  process.env['CLIENT_DIST_DIR'] ??
  resolve(serverEntryFolder, '..', 'dist', 'dev', 'public')
const app = createExpressServer({ clientDistFolder })

// TODO: dotenv
const port = process.env['PORT'] ?? '4000'
app.listen(port, (error?: Error) => {
  if (error) {
    throw error
  }

  console.log(`Node Express server listening on http://localhost:${port}`)
})
