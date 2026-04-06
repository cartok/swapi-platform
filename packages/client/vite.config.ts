import { fileURLToPath, URL } from 'node:url'

import angular from '@analogjs/vite-plugin-angular'
import type { UserConfig } from 'vite'
import {
  defaultClientConditions,
  defineConfig,
  mergeConfig,
  transformWithOxc,
} from 'vite'

import { browserEnv, buildEnv } from './src/env'
import type { AppBrowserEnv } from './src/env.schema'

export default defineConfig(({ isSsrBuild }) => {
  const definedBrowserEnv = Object.fromEntries(
    (
      Object.entries(browserEnv) as [
        keyof AppBrowserEnv,
        AppBrowserEnv[keyof AppBrowserEnv],
      ][]
    ).map(([key, value]) => {
      return [key, typeof value === 'string' ? `"${value}"` : value]
    }),
  ) satisfies Record<string, string | boolean | number>

  const config: UserConfig = {
    clearScreen: false,
    envDir: false,
    mode: browserEnv.SWAPI_OUTPUT_MODE,
    build: {
      emptyOutDir: true,
      minify: browserEnv.SWAPI_OUTPUT_MODE === 'production',
      sourcemap: browserEnv.SWAPI_OUTPUT_MODE === 'production',
    },
    define: {
      ...definedBrowserEnv,
      ngServerMode: isSsrBuild,
    },
    resolve: {
      conditions:
        browserEnv.SWAPI_OUTPUT_MODE === 'development'
          ? ['@swapi/source', ...defaultClientConditions]
          : undefined,
      mainFields: ['module'],
      alias: [
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
        tsconfig: fileURLToPath(new URL('./tsconfig.vite.json', import.meta.url)),
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

  if (browserEnv.SWAPI_TARGET === 'local') {
    const developmentServerConfig: UserConfig = {
      server: {
        host: 'localhost',
        port: buildEnv.SWAPI_DEV_SERVER_PORT,
        strictPort: true,
      },
      preview: {
        host: 'localhost',
        port: buildEnv.SWAPI_PREVIEW_SERVER_PORT,
        strictPort: true,
      },
    }

    return mergeConfig(config, developmentServerConfig)
  }

  return config
})
