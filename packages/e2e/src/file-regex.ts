import type { Flag } from '#internal/flags'
import { FLAGS } from '#internal/flags'
import type { Label } from '#internal/labels'
import { LABELS } from '#internal/labels'

interface TestFileSpec {
  label?: Label
  labels?: readonly Label[]
  flag?: Flag
  flags?: readonly Flag[]
}

type TestFileRegexInput =
  | Label
  | readonly Label[]
  | Flag
  | readonly Flag[]
  | TestFileSpec
  | readonly TestFileSpec[]

export function createTestFilesRegex(): RegExp
export function createTestFilesRegex(input: Label): RegExp
export function createTestFilesRegex(input: readonly Label[]): RegExp
export function createTestFilesRegex(input: Flag): RegExp
export function createTestFilesRegex(input: readonly Flag[]): RegExp
export function createTestFilesRegex(input: TestFileSpec): RegExp
export function createTestFilesRegex(input: readonly TestFileSpec[]): RegExp
export function createTestFilesRegex(input?: TestFileRegexInput): RegExp {
  if (typeof input === 'undefined') {
    return new RegExp(String.raw`.+\.spec\.ts$`)
  }

  const suffixAlternatives = createTestFileSuffixAlternatives(input)
  if (!suffixAlternatives.length) {
    throw new Error('No test file suffix alternatives.')
  }

  return new RegExp(String.raw`.+\.(?:${suffixAlternatives.join('|')})\.spec\.ts$`)
}

function createTestFileSuffixAlternatives(input: TestFileRegexInput): string[] {
  const specs = normalizeTestFileSpecs(input)
  const suffixAlternatives = specs.flatMap((spec) => {
    const labels = resolveSpecLabels(spec)
    const flags = resolveSpecFlags(spec)

    if (labels.length && flags.length) {
      return labels.flatMap((label) =>
        flags.map((flag) => String.raw`${RegExp.escape(label)}\.${RegExp.escape(flag)}`),
      )
    }

    if (labels.length) {
      const optionalFlagGroup = createOptionalFlagGroup()

      return labels.map(
        (label) => String.raw`${RegExp.escape(label)}${optionalFlagGroup}`,
      )
    }

    if (flags.length) {
      const optionalLabelGroup = createOptionalLabelGroup()

      return flags.map((flag) => String.raw`${optionalLabelGroup}${RegExp.escape(flag)}`)
    }

    throw new Error('Test file spec must contain at least one label or flag.')
  })

  return [...new Set(suffixAlternatives)]
}

function normalizeTestFileSpecs(input: TestFileRegexInput): TestFileSpec[] {
  if (typeof input === 'string') {
    return [normalizeTestFileSegment(input)]
  }

  if (isTestFileSpec(input)) {
    return [input]
  }

  if (input.length === 0) {
    throw new Error('No test file regex input.')
  }

  if (isTestFileSegmentArray(input)) {
    const segments = input.map((value) => normalizeTestFileSegment(value))
    const hasLabel = segments.some((segment) => segment.label)
    const hasFlag = segments.some((segment) => segment.flag)

    if (hasLabel && hasFlag) {
      throw new Error('Use object specs for mixed label and flag matching.')
    }

    return hasLabel
      ? [{ labels: segments.map((segment) => segment.label).filter(isPresent) }]
      : [{ flags: segments.map((segment) => segment.flag).filter(isPresent) }]
  }

  if (isTestFileSpecArray(input)) {
    return [...input]
  }

  throw new Error('Invalid test file regex input.')
}

function normalizeTestFileSegment(segment: string): TestFileSpec {
  const segmentText = segment

  if (isLabel(segment) && isFlag(segment)) {
    throw new Error(`Ambiguous test file segment: ${segmentText}`)
  }

  if (isLabel(segment)) {
    return { label: segment }
  }

  if (isFlag(segment)) {
    return { flag: segment }
  }

  throw new Error(`Unknown test file segment: ${segmentText}`)
}

function resolveSpecLabels(spec: TestFileSpec): Label[] {
  return [spec.label, ...(spec.labels ?? [])].filter(isPresent)
}

function resolveSpecFlags(spec: TestFileSpec): Flag[] {
  return [spec.flag, ...(spec.flags ?? [])].filter(isPresent)
}

function createOptionalLabelGroup(): string {
  const labelGroup = createSegmentGroup(Object.values(LABELS))

  return String.raw`(?:${labelGroup}\.)?`
}

function createOptionalFlagGroup(): string {
  const flagGroup = createSegmentGroup(Object.values(FLAGS))

  return String.raw`(?:\.${flagGroup})?`
}

function createSegmentGroup(segments: readonly string[]): string {
  return String.raw`(?:${segments.map((segment) => RegExp.escape(segment)).join('|')})`
}

function isTestFileSpec(value: unknown): value is TestFileSpec {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTestFileSegmentArray(value: readonly unknown[]): value is readonly string[] {
  return value.every((item) => typeof item === 'string')
}

function isTestFileSpecArray(
  value: readonly unknown[],
): value is readonly TestFileSpec[] {
  return value.every(isTestFileSpec)
}

function isLabel(value: string): value is Label {
  return Object.values(LABELS).some((label) => label === value)
}

function isFlag(value: string): value is Flag {
  return Object.values(FLAGS).some((flag) => flag === value)
}

function isPresent<value>(value: value | undefined): value is value {
  return typeof value !== 'undefined'
}
