const AUDIO_FILE_EXTENSION_LIST = [] as const
const FONT_FILE_EXTENSION_LIST = ['woff2'] as const
const IMAGE_FILE_EXTENSION_LIST = ['ico', 'jpg', 'png', 'svg'] as const
const SCRIPT_FILE_EXTENSION_LIST = ['js', 'wasm'] as const
const STYLE_FILE_EXTENSION_LIST = ['css'] as const
const VIDEO_FILE_EXTENSION_LIST = [] as const
const DATA_FILE_EXTENSION_LIST = ['txt'] as const

const SCRIPT_AND_STYLE_FILE_EXTENSION_LIST = [
  ...SCRIPT_FILE_EXTENSION_LIST,
  ...STYLE_FILE_EXTENSION_LIST,
] as const

const MEDIA_FILE_EXTENSION_LIST = [
  ...AUDIO_FILE_EXTENSION_LIST,
  ...IMAGE_FILE_EXTENSION_LIST,
  ...VIDEO_FILE_EXTENSION_LIST,
] as const

const ASSET_FILE_EXTENSION_LIST = [
  ...MEDIA_FILE_EXTENSION_LIST,
  ...FONT_FILE_EXTENSION_LIST,
  ...DATA_FILE_EXTENSION_LIST,
] as const

const FILE_EXTENSION_LIST = [
  ...SCRIPT_AND_STYLE_FILE_EXTENSION_LIST,
  ...ASSET_FILE_EXTENSION_LIST,
] as const

export type FileExtension = (typeof FILE_EXTENSION_LIST)[number]

export const FILE_EXTENSION_SET = new Set(FILE_EXTENSION_LIST)

export function isRegisteredFileExtension(value: string): value is FileExtension {
  return FILE_EXTENSION_SET.has(value as FileExtension)
}

export const IMAGE_FILE_EXTENSION_SET = new Set<FileExtension>(IMAGE_FILE_EXTENSION_LIST)
export const VIDEO_FILE_EXTENSION_SET = new Set<FileExtension>(VIDEO_FILE_EXTENSION_LIST)
export const AUDIO_FILE_EXTENSION_SET = new Set<FileExtension>(AUDIO_FILE_EXTENSION_LIST)
export const FONT_FILE_EXTENSION_SET = new Set<FileExtension>(FONT_FILE_EXTENSION_LIST)
export const STYLE_FILE_EXTENSION_SET = new Set<FileExtension>(STYLE_FILE_EXTENSION_LIST)
export const SCRIPT_FILE_EXTENSION_SET = new Set<FileExtension>(
  SCRIPT_FILE_EXTENSION_LIST,
)
export const DATA_FILE_EXTENSION_SET = new Set<FileExtension>(DATA_FILE_EXTENSION_LIST)
export const ASSET_FILE_EXTENSION_SET = new Set<FileExtension>(ASSET_FILE_EXTENSION_LIST)
