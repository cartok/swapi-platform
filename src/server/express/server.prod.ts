import { resolve } from 'node:path'

import { createExpressServer } from '@/server/express/server'

const clientDistFolder = resolve(process.cwd(), 'dist/vite/client')
const app = createExpressServer({ clientDistFolder })

// TODO: dotenv
const port = process.env['PORT'] || 4000
app.listen(port, (error) => {
  if (error) {
    throw error
  }

  console.log(`Node Express server listening on http://localhost:${port}`)
})
