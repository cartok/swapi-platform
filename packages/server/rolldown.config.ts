import { needsLinking } from '@angular/compiler-cli/linker'
import angularLinkerBabelPlugin from '@angular/compiler-cli/linker/babel'
import type { TransformOptions } from '@babel/core'
import { transformAsync } from '@babel/core'
import { logEnv } from '@swapi/shared/environment/env'
import { envToOxcDefine } from '@swapi/shared/environment/globals'
import { defineConfig } from 'rolldown'

// This import had to be relative.
import { env } from './src/env.js'

logEnv(env, 'App Server Build Environment Variables')

const buildVariantPath = `${env.SWAPI_TARGET_ENVIRONMENT}/${env.SWAPI_BUILD_LEVEL}`
const isMinifyEnabled = env.SWAPI_MINIFY
const externalDependencies = new Set(['@swapi/client/dist-paths'])

const serverBundleConfig = defineConfig({
  input: {
    server: `./dist/${buildVariantPath}/build/server.js`,
    ['ssr/render-worker']: `./dist/${buildVariantPath}/build/ssr/render-worker.js`,
  },
  tsconfig: './tsconfig/tsconfig.server.bundler.json',
  platform: 'node',
  plugins: [
    createAngularLinkerAotPlugin({
      sourceMaps: fromRolldownSourceMapsToBabelSourceMaps(env.SWAPI_ROLLDOWN_SOURCE_MAPS),
    }),
  ],
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${env.SWAPI_BUILD_LEVEL}`,
      'node',
      'default',
    ],
  },
  external: (id) => externalDependencies.has(id),
  transform: {
    define: {
      ...envToOxcDefine(env),
      ngServerMode: 'true',
    },
  },
  output: {
    dir: `./dist/${buildVariantPath}/bundle`,
    cleanDir: true,
    minify: isMinifyEnabled,
    comments: !isMinifyEnabled,
    sourcemap: env.SWAPI_ROLLDOWN_SOURCE_MAPS,
  },
})

export default defineConfig([serverBundleConfig])

function fromRolldownSourceMapsToBabelSourceMaps(
  sourceMaps: typeof env.SWAPI_ROLLDOWN_SOURCE_MAPS,
): TransformOptions['sourceMaps'] {
  if (typeof sourceMaps === 'boolean') {
    return sourceMaps
  }
  switch (sourceMaps) {
    case 'hidden':
      return true
    case 'inline':
      return true
  }
}

function createAngularLinkerAotPlugin(babelTransformOptions: TransformOptions) {
  const angularModulePathPattern = /node_modules[\\/]+@angular[\\/].+\.(?:mjs|js)$/

  return {
    name: 'angular-linker-aot',
    transform: {
      filter: {
        id: angularModulePathPattern,
      },
      async handler(code: string, id: string) {
        if (!needsLinking(id, code)) {
          return null
        }

        const result = await transformAsync(code, {
          filename: id,
          sourceType: 'module',
          configFile: false,
          babelrc: false,
          parserOpts: {
            sourceType: 'module',
          },
          plugins: [[angularLinkerBabelPlugin, { linkerJitMode: false }]],
          compact: false,
          ...babelTransformOptions,
        })

        if (!result?.code) {
          return null
        }

        return {
          code: result.code,
          map: result.map ?? null,
        }
      },
    },
  }
}
