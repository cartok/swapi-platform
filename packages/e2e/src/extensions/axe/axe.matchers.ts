import assert from 'node:assert'

import { expect } from '@playwright/test'
import type {
  AxeResults,
  ImpactValue,
  IncompleteResult,
  Result,
  RuleError,
} from 'axe-core'

import { issueResultTypes } from '#internal/extensions/axe/axe'

export const axeMatchers = expect.extend({
  toHaveNoAxeIssues(results: AxeResults) {
    const hasIssue = issueResultTypes.some((x) => results[x].length)

    if (!hasIssue) {
      return {
        pass: true,
        message: () => 'Passed axe checks.',
      }
    }

    return {
      pass: false,
      message: () => {
        const violationsMessage = results.violations
          .map((result) => new FormattedResult(result).toString())
          .join('\n')

        const incompleteMessage = results.incomplete
          .map((result) => new FormattedIncompleteResult(result).toString())
          .join('\n')

        const messages = [violationsMessage, incompleteMessage].join('\n\n')

        return messages
      },
    }
  },
})

class FormattedResult<result extends Result> {
  constructor(protected readonly result: result) {}

  toString(): string {
    return this.createResultText()
  }

  protected createResultText() {
    const heading = [
      this.createBadge(this.result.impact),
      `${this.result.id}: ${this.result.help}`,
    ]
      .filter(Boolean)
      .join(' ')

    const docs = `Documentation: ${this.result.helpUrl}`
    const nodes = this.result.nodes
      .filter((node) => Boolean(node.target))
      .map((node) =>
        ['-', this.createBadge(node.impact), node.target.join(', ')]
          .filter(Boolean)
          .join(' '),
      )

    const lines = [heading, docs, 'Elements:', ...nodes]
    const text = lines.join('\n')

    return text
  }

  protected createBadge(value: ImpactValue | undefined): string | null {
    return !value ? null : `[${value}]`
  }
}

class FormattedIncompleteResult extends FormattedResult<IncompleteResult> {
  override toString() {
    const text = [this.createResultText(), this.#createErrorText()]
      .filter(Boolean)
      .join('\n\n')

    return text
  }

  #createErrorText(): string | null {
    if (!this.result.error) {
      return null
    }

    const method = !this.result.error.method ? null : `method=${this.result.error.method}`
    const rule = !this.result.error.ruleId ? null : `rule=${this.result.error.ruleId}`
    const meta = [method, rule].filter(Boolean).join(', ')
    const cause = this.#createCauseText(this.result.error.cause)

    const lines = ['Error:', meta, cause]
    const text = lines.filter(Boolean).join('\n')

    return text
  }

  #createCauseText(cause: RuleError['cause']) {
    if (!this.result.error?.cause) {
      return null
    }

    const causeChain = Array.from(this.yieldCause(cause, 1)).map(
      (cause) => `${cause.name}: ${cause.message}`,
    )
    const lines = ['\t\t\tcauses:', causeChain.join(' -> ')]
    const text = lines.join(' ')

    return text
  }

  private *yieldCause(cause: RuleError['cause'], limit = 1) {
    assert(limit >= 1)
    if (!cause) {
      return
    }

    let current = cause
    let level = 1

    yield current
    level++

    while (current.cause && level <= limit) {
      yield current.cause
      current = current.cause
      level++
    }
  }
}
