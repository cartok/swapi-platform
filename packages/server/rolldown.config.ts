import { buildEnv } from '@swapi/shared/environment/env'
import { defineConfig } from 'rolldown'

const buildVariantPath = `${buildEnv.SWAPI_TARGET}/${buildEnv.SWAPI_OUTPUT_MODE}`

const serverBundleConfig = defineConfig({
  input: `./dist/${buildVariantPath}/build/server.js`,
  tsconfig: './tsconfig/tsconfig.server.bundle.json',
  platform: 'node',
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${buildEnv.SWAPI_OUTPUT_MODE}`,
      'node',
      'default',
    ],
  },
  external: (id) => id.startsWith('@angular/') || id === '@swapi/client/dist-paths',
  output: {
    dir: `./dist/${buildVariantPath}/bundle`,
    cleanDir: true,
    banner: "import '@angular/compiler';",
    minify: buildEnv.SWAPI_OUTPUT_MODE === 'production',
    comments: buildEnv.SWAPI_OUTPUT_MODE === 'development',
  },
})

const dockerScriptsBundleConfig = defineConfig({
  input: {
    'create-bundle-link': './docker/create-bundle-link.ts',
    'start-server-bundle': './docker/start-server-bundle.ts',
  },
  tsconfig: './tsconfig/tsconfig.server.docker.json',
  platform: 'node',
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${buildEnv.SWAPI_OUTPUT_MODE}`,
      'node',
      'default',
    ],
  },
  output: {
    dir: `./dist/${buildVariantPath}/bundle/scripts`,
    cleanDir: true,
    entryFileNames: '[name].js',
    chunkFileNames: 'docker-script-chunk-[hash].js',
    minify: buildEnv.SWAPI_OUTPUT_MODE === 'production',
    comments: buildEnv.SWAPI_OUTPUT_MODE === 'development',
  },
})

export default defineConfig([serverBundleConfig, dockerScriptsBundleConfig])
