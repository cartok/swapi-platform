import { defineConfig } from 'rolldown'

import { env } from './src/env.js'

const buildVariantPath = `${env.SWAPI_TARGET}/${env.SWAPI_PROFILE}`
const isMinifyEnabled = env.SWAPI_BUILD_MINIFY
const buildSourcemap = toRolldownSourcemap(env.SWAPI_BUILD_SOURCEMAP)

const serverBundleConfig = defineConfig({
  input: {
    server: `./dist/${buildVariantPath}/build/server.bundle.js`,
  },
  tsconfig: './tsconfig/tsconfig.server.bundle.json',
  platform: 'node',
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${env.SWAPI_PROFILE}`,
      'node',
      'default',
    ],
  },
  external: (id) => id === '@swapi/client/dist-paths',
  output: {
    dir: `./dist/${buildVariantPath}/bundle`,
    cleanDir: true,
    minify: isMinifyEnabled,
    comments: !isMinifyEnabled,
    sourcemap: buildSourcemap,
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
      `@swapi/${env.SWAPI_PROFILE}`,
      'node',
      'default',
    ],
  },
  output: {
    dir: `./dist/${buildVariantPath}/bundle/scripts`,
    cleanDir: true,
    entryFileNames: '[name].js',
    chunkFileNames: 'docker-script-chunk-[hash].js',
    minify: isMinifyEnabled,
    comments: !isMinifyEnabled,
    sourcemap: buildSourcemap,
  },
})

export default defineConfig([serverBundleConfig, dockerScriptsBundleConfig])

function toRolldownSourcemap(
  sourceMap: typeof env.SWAPI_BUILD_SOURCEMAP,
): boolean | 'hidden' | 'inline' {
  switch (sourceMap) {
    case 'external':
      return true
    case 'hidden':
      return 'hidden'
    case 'inline':
      return 'inline'
    case 'none':
      return false
  }
}
