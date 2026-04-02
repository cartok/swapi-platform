import fs from 'node:fs/promises'

import { BREAKPOINTS } from '##/device/context'

const widthTokenLines = BREAKPOINTS.width.map(
  (widthValue) => `@custom-media --mw-${widthValue} (max-width: ${widthValue}px);`,
)
const heightTokensLines = BREAKPOINTS.height.map(
  (heightValue) => `@custom-media --mh-${heightValue} (max-height: ${heightValue}px);`,
)
const css = `${[...widthTokenLines, ...heightTokensLines].join('\n')}\n`

const outputDir = new URL('../generated/css/', import.meta.url)
const outputFile = new URL('media.css', outputDir)

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(outputFile, css)
