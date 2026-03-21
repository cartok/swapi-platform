import fs from 'node:fs/promises'

import Ajv2020 from 'ajv/dist/2020'
import standaloneCode from 'ajv/dist/standalone'

import schema from './device-cookie.schema.json' with { type: 'json' }

const ajv = new Ajv2020({
  code: { esm: true, source: true },
})

const validate = ajv.compile(schema)

const BASE_NAME = 'device-cookie.validator'
const validator = standaloneCode(ajv, validate)
// TODO: build & start um zu gucken ob mjs extension nötig wäre
const dts = `
export const validate: (<T>(data: unknown) => data is T) & {
  errors: null | {
    instancePath: string
    schemaPath: string
    keyword: string
    params: Record<string, unknown>
    message: string
  }
  evaluated: { props: boolean, dynamicProps: boolean, dynamicItems: boolean }
}
`
const outputDir = new URL('../generated/validators/', import.meta.url)
const outputFile = new URL(`${BASE_NAME}.js`, outputDir)
const outputFileDts = new URL(`${BASE_NAME}.d.ts`, outputDir)

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(outputFile, validator)
await fs.writeFile(outputFileDts, dts)
