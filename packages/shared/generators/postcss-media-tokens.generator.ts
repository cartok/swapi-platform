import fs from 'node:fs/promises'

import { BREAKPOINTS } from '@/device/context'

const widthTokenLines = BREAKPOINTS.width.map(
  (widthValue) => `@custom-media --mw-${widthValue} (max-width: ${widthValue}px);`,
)
const heightTokensLines = BREAKPOINTS.height.map(
  (heightValue) => `@custom-media --mh-${heightValue} (max-height: ${heightValue}px);`,
)
const combinedTokens: string[] = []

for (const widthValue of BREAKPOINTS.width) {
  for (const heightValue of BREAKPOINTS.height) {
    combinedTokens.push(
      `@custom-media --mw-${widthValue}-mh-${heightValue} (max-width: ${widthValue}px) and (max-height: ${heightValue}px);`,
    )
  }
}

const mediaTokens = `${[...widthTokenLines, ...heightTokensLines, ...combinedTokens].join('\n')}\n`

const outputDir = new URL('../generated/css/', import.meta.url)
const outputFile = new URL('media.css', outputDir)

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(outputFile, mediaTokens)
