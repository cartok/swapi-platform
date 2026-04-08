import { defineConfig } from 'rolldown'

import { env } from '#internal/env'

export default defineConfig({
  input: `./dist/${env.SWAPI_TARGET}/${env.SWAPI_OUTPUT_MODE}/build/server.js`,
  tsconfig: './tsconfig/tsconfig.server.bundle.json',
  platform: 'node',
  external: (id) => id.startsWith('@angular/'),
  output: {
    cleanDir: true,
    banner: "import '@angular/compiler';",
    minify: env.SWAPI_OUTPUT_MODE === 'production',
    comments: env.SWAPI_OUTPUT_MODE === 'development',
  },
})
