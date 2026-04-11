import { parseBuildEnv } from '@swapi/shared/environment/env'
import { defineConfig } from 'rolldown'

const env = parseBuildEnv()
const buildVariantPath = `${env.SWAPI_TARGET}/${env.SWAPI_OUTPUT_MODE}`

export default defineConfig({
  input: `./dist/${buildVariantPath}/build/server.js`,
  tsconfig: './tsconfig/tsconfig.server.bundle.json',
  platform: 'node',
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${env.SWAPI_OUTPUT_MODE}`,
      'node',
      'default',
    ],
  },
  external: (id) => id.startsWith('@angular/') || id === '@swapi/client/dist-paths',
  output: {
    cleanDir: true,
    banner: "import '@angular/compiler';",
    minify: env.SWAPI_OUTPUT_MODE === 'production',
    comments: env.SWAPI_OUTPUT_MODE === 'development',
  },
})
