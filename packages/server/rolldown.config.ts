import { needsLinking } from '@angular/compiler-cli/linker'
import angularLinkerBabelPlugin from '@angular/compiler-cli/linker/babel'
import type { TransformOptions } from '@babel/core'
import { transformAsync } from '@babel/core'
import { envToOxcDefine } from '@swapi/shared/environment/globals'
import type { Plugin } from 'rolldown'
import { defineConfig } from 'rolldown'

// These imports have to be relative for bundling.
import { buildEnv } from './src/env'
import { BUILD_ENV_MANIFEST_FILE_NAME } from './src/env.manifest'
import { logServerEnv } from './src/log/log-env'

console.log('App-Server (Rolldown)')
logServerEnv()

const buildVariantPath = `${buildEnv.BUILD_TARGET_ENVIRONMENT}/${buildEnv.BUILD_PROFILE}`
const isMinifyEnabled = buildEnv.BUILD_MINIFY
const externalDependencies = new Set(['@swapi/client/dist-paths'])
const serverBundleConfig = defineConfig({
  input: {
    server: `./dist/${buildVariantPath}/build/server.js`,
    ['ssr/render-worker']: `./dist/${buildVariantPath}/build/ssr/render-worker.js`,
  },
  tsconfig: './tsconfig/tsconfig.server.bundler.json',
  platform: 'node',
  plugins: [
    createBuildEnvManifestPlugin(),
    createAngularLinkerAotPlugin({
      sourceMaps: fromRolldownSourceMapsToBabelSourceMaps(buildEnv.BUILD_SOURCE_MAPS),
    }),
  ],
  resolve: {
    conditionNames: [
      `@swapi/${buildVariantPath}`,
      `@swapi/${buildEnv.BUILD_PROFILE}`,
      'node',
      'default',
    ],
  },
  external: (id) => externalDependencies.has(id),
  transform: {
    define: {
      ...envToOxcDefine({ ...buildEnv, ngServerMode: true }),
    },
  },
  output: {
    dir: `./dist/${buildVariantPath}/bundle`,
    cleanDir: true,
    minify: isMinifyEnabled,
    comments: !isMinifyEnabled,
    sourcemap: buildEnv.BUILD_SOURCE_MAPS,
  },
})

export default defineConfig([serverBundleConfig])

function fromRolldownSourceMapsToBabelSourceMaps(
  sourceMaps: typeof buildEnv.BUILD_SOURCE_MAPS,
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

function createBuildEnvManifestPlugin(): Plugin {
  return {
    name: 'build-env-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: BUILD_ENV_MANIFEST_FILE_NAME,
        source: JSON.stringify(buildEnv),
      })
    },
  }
}
