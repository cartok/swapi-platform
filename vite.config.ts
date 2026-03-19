import { fileURLToPath, URL } from 'node:url'

import angular from '@analogjs/vite-plugin-angular'
import { defineConfig } from 'vite'

export default defineConfig({
  clearScreen: false,
  root: './src',
  publicDir: '../public',
  build: {
    outDir: '../dist/vite/client',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: [
      {
        find: '@/generated',
        replacement: fileURLToPath(new URL('./generated', import.meta.url)),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
    mainFields: ['module'],
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
    angular({
      tsconfig: fileURLToPath(new URL('./tsconfig.app.json', import.meta.url)),
    }),
  ],
})
