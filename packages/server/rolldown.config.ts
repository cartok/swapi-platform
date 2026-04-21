import { needsLinking } from '@angular/compiler-cli/linker'
import angularLinkerBabelPlugin from '@angular/compiler-cli/linker/babel'
import type { TransformOptions } from '@babel/core'
import { transformAsync } from '@babel/core'
import { logEnv } from '@swapi/shared/environment/env'
import type { OutputOptions } from 'rolldown'
import { defineConfig } from 'rolldown'

import { env } from './src/env.js'

logEnv(env, 'App Server Environment Variables')

const buildVariantPath = `${env.SWAPI_TARGET}/${env.SWAPI_PROFILE}`
const isMinifyEnabled = env.SWAPI_BUILD_MINIFY
const rolldownSourcemap = toRolldownSourcemap(env.SWAPI_BUILD_SOURCEMAP)
const babelSourcemap = toBabelSourcemap(env.SWAPI_BUILD_SOURCEMAP)
const externalDependencies = new Set(['@swapi/client/dist-paths'])

const serverBundleConfig = defineConfig({
  input: {
    server: `./dist/${buildVariantPath}/build/server.js`,
  },
  tsconfig: './tsconfig/tsconfig.server.bundle.json',
  platform: 'node',
  plugins: [createAngularLinkerAotPlugin({ sourceMaps: babelSourcemap })],
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${env.SWAPI_PROFILE}`,
      'node',
      'default',
    ],
  },
  external: (id) => externalDependencies.has(id),
  output: {
    dir: `./dist/${buildVariantPath}/bundle`,
    cleanDir: true,
    minify: isMinifyEnabled,
    comments: !isMinifyEnabled,
    sourcemap: rolldownSourcemap,
  },
})

export default defineConfig([serverBundleConfig])

function toRolldownSourcemap(
  sourceMap: typeof env.SWAPI_BUILD_SOURCEMAP,
): OutputOptions['sourcemap'] {
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

function toBabelSourcemap(
  sourceMap: typeof env.SWAPI_BUILD_SOURCEMAP,
): TransformOptions['sourceMaps'] {
  if (sourceMap !== 'none') {
    return true
  } else {
    return false
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
