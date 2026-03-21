import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createExpressServer } from '@/server'

const serverEntryFolder = dirname(fileURLToPath(import.meta.url))
const clientDistFolder = resolve(serverEntryFolder, '..', 'public')
const app = createExpressServer({ clientDistFolder })

// TODO: dotenv
const port = process.env['PORT'] ?? '4000'
app.listen(port, (error?: Error) => {
  if (error) {
    throw error
  }

  console.log(`Node Express server listening on http://localhost:${port}`)
})
