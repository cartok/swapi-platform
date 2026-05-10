type CacheHeaders = Record<string, string>

export const DOCUMENT_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['public', 'no-cache']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=1800',
  ]),
}

export const HASHED_FILE_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=31536000', 'immutable']),
  'CDN-Cache-Control': toCacheControlValue(['public', 's-maxage=31536000', 'immutable']),
}

export const UNHASHED_SCRIPT_AND_STYLE_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['public', 'no-cache']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=3600',
  ]),
}

export const UNHASHED_ASSET_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=86400']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=3600',
  ]),
}

export const NO_STORE_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['private', 'no-store']),
  'CDN-Cache-Control': 'no-store',
} as const

function toCacheControlValue(directives: readonly string[]): string {
  return directives.join(', ')
}
