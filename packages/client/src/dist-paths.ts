import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const distPath = dirname(fileURLToPath(import.meta.url))
export const browserDistPath = resolve(distPath, './browser')
export const ssrDistPath = resolve(distPath, './ssr')
export const ssgDistPath = resolve(distPath, './ssg')
export const indexHtmlPath = resolve(browserDistPath, './index.html')
