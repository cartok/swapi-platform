import { fileURLToPath, URL } from 'node:url'

import angular from '@analogjs/vite-plugin-angular'
import { defaultClientConditions, defineConfig, transformWithOxc } from 'vite'

import { env } from './src/env'

export default defineConfig(({ isSsrBuild }) => {
  return {
    clearScreen: false,
    envDir: false,
    mode: env.SWAPI_OUTPUT_MODE,
    build: {
      emptyOutDir: true,
      minify: env.SWAPI_OUTPUT_MODE === 'production',
      sourcemap: env.SWAPI_OUTPUT_MODE === 'production',
    },
    define: {
      ...Object.entries(env).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: typeof value === 'string' ? `"${value}"` : value,
        }),
        {},
      ),
      ngServerMode: isSsrBuild,
    },
    resolve: {
      conditions:
        env.SWAPI_OUTPUT_MODE === 'development'
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
    server: {
      host: 'localhost',
      port: 4200,
      strictPort: true,
    },
    preview: {
      host: 'localhost',
      port: 4300,
      strictPort: true,
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
})
