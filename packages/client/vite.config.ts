import { fileURLToPath, URL } from 'node:url'

import angular from '@analogjs/vite-plugin-angular'
import type { UserConfig } from 'vite'
import {
  defaultClientConditions,
  defaultServerConditions,
  defineConfig,
  mergeConfig,
  transformWithOxc,
} from 'vite'

// Those vite runner related imports had to be relative.
import { logEnv } from '../shared/src/environment/env'
import { envToOxcDefine } from '../shared/src/environment/globals'
import { browserEnv, buildEnv } from './src/env'
import type { AppBuildEnv, ViteMode } from './src/env.schema'

logEnv(browserEnv, 'Vite App Environment Variables (Browser)')
logEnv(buildEnv, 'Vite App Environment Variables (Build)')

const clientResolveConditions: string[] = createResolveConditions(defaultClientConditions)
const serverResolveConditions: string[] = createResolveConditions(defaultServerConditions)
const viteMode: ViteMode = fromBuildVariantToViteMode(buildEnv.SWAPI_BUILD_LEVEL)

export default defineConfig(({ isSsrBuild }) => {
  const config: UserConfig = {
    base: buildEnv.SWAPI_CLIENT_PUBLIC_BASE_PATH,
    clearScreen: false,
    envDir: false,
    mode: viteMode,
    build: {
      manifest: true,
      ssrManifest: true,
      emptyOutDir: true,
      minify: buildEnv.SWAPI_MINIFY,
      sourcemap: buildEnv.SWAPI_VITE_SOURCE_MAPS,
    },
    define: {
      ...envToOxcDefine(browserEnv),
      VITE_MODE: `"${viteMode}"`,
      ngServerMode: `${isSsrBuild}`,
    },
    resolve: {
      conditions: clientResolveConditions,
      mainFields: ['module'],
      alias: [
        {
          find: /^@\/assets\//,
          replacement: fileURLToPath(new URL('./src/assets/', import.meta.url)),
        },
        {
          find: /^@\/css\//,
          replacement: fileURLToPath(new URL('./src/css/', import.meta.url)),
        },
        {
          find: /^@\//,
          replacement: fileURLToPath(new URL('./src/app/', import.meta.url)),
        },
      ],
    },
    ssr: {
      resolve: {
        conditions: serverResolveConditions,
      },
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        drafts: {
          customMedia: true,
        },
      },
    },
    plugins: [
      /**
       * Workaround for `@analogjs/vite-plugin-angular`:
       *
       * Limit Angular transforms to this app's own source files only. Workspace `.ts` files from
       * other packages are excluded because, in this setup, letting the Angular plugin handle them
       * can result in empty module output during dev.
       *
       * A small post-transform plugin then transpiles those non-app `.ts` files explicitly via
       * `transformWithOxc(...)` so they are still delivered as valid browser-executable JavaScript.
       *
       * Intended for plain TypeScript from sibling workspace packages, not extra Angular-decorated
       * code outside the app package.
       *
       * Additionally, as of now, there is no good solution to import `paths` aliased files or
       * workspace modules inside of a vite config. The best solution for now is to import
       * relative paths & use the `runner` config loader for development mode.
       */
      angular({
        tsconfig: fileURLToPath(new URL('./tsconfig/tsconfig.app.json', import.meta.url)),
        transformFilter: (_code, id) => {
          return id.includes('/packages/client/src/')
        },
      }),
      {
        name: 'vite-plugin-angular-in-monorepo',
        enforce: 'post',
        transform: {
          filter: {
            moduleType: ['ts'],
            id: {
              include: /\/packages\//,
              exclude: /\/packages\/client\/src\//,
            },
          },
          async handler(code: string, id: string) {
            return transformWithOxc(code, id, { sourcemap: true })
          },
        },
      },
    ],
  }

  if (buildEnv.SWAPI_TARGET_ENVIRONMENT === 'local') {
    const developmentServerConfig: UserConfig = {
      server: {
        host: 'localhost',
        port: buildEnv.SWAPI_CLIENT_SERVER_PORT_DEV,
        strictPort: true,
      },
      preview: {
        host: 'localhost',
        port: buildEnv.SWAPI_CLIENT_SERVER_PORT_PREVIEW,
        strictPort: true,
      },
    }

    return mergeConfig(config, developmentServerConfig)
  }

  return config
})

function fromBuildVariantToViteMode(
  buildVariant: AppBuildEnv['SWAPI_BUILD_LEVEL'],
): ViteMode {
  switch (buildVariant) {
    case 'development':
      return 'development'
    case 'release':
      return 'production'
  }
}

function createResolveConditions(
  defaultConditions: string[] | readonly string[],
): string[] {
  const sharedCondition =
    buildEnv.SWAPI_SOURCE_MODE === 'source'
      ? '@swapi/shared/source'
      : `@swapi/${buildEnv.SWAPI_BUILD_LEVEL}`

  return [sharedCondition, ...defaultConditions]
}
