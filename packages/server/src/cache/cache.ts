export const CACHE_TAGS = {
  HTML: 'html',
  SSR: 'ssr',
  SSG: 'ssg',
  JS: 'js',
  CSS: 'css',
  FONT: 'font',
  AUDIO: 'audio',
  VIDEO: 'video',
  IMAGE: 'image',
  MEDIA: 'media',
  ASSET: 'asset',
} as const

type CacheHeaders = Record<string, string>

export const DOCUMENT_CACHE_HEADERS = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=0', 'must-revalidate']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=1800',
  ]),
} satisfies CacheHeaders

export const UNHASHED_SCRIPT_STYLE_CACHE_HEADERS = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=0', 'must-revalidate']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=3600',
  ]),
} satisfies CacheHeaders

export const UNHASHED_MEDIA_CACHE_HEADERS = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=86400']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=3600',
  ]),
} satisfies CacheHeaders

function toCacheControlValue(directives: readonly string[]): string {
  return directives.join(', ')
}
