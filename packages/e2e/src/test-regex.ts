const text = {
  flags: 'u' as const,
  patterns: {
    normalCharacter: String.raw`[^\p{C}]`,
    lineBreak: String.raw`(?:\n|\r\n)`,
  },
} as const

export const testRegex = {
  number: {
    fourDigits: /^\d{4}$/u,
  },
  text: {
    multiline: new RegExp(
      String.raw`^(?:${text.patterns.normalCharacter}|${text.patterns.lineBreak})+$`,
      text.flags,
    ),
    multilineOptional: new RegExp(
      String.raw`^(?:${text.patterns.normalCharacter}|${text.patterns.lineBreak})*$`,
      text.flags,
    ),
    singleLine: new RegExp(String.raw`^${text.patterns.normalCharacter}+$`, text.flags),
    singleLineOptional: new RegExp(
      String.raw`^${text.patterns.normalCharacter}*$`,
      text.flags,
    ),
    singleLineEndingWith(strings: TemplateStringsArray, ...values: string[]): RegExp {
      const suffix = strings.reduce(
        (result, part, index) => result + part + (values[index] ?? ''),
        '',
      )

      if (!this.singleLine.test(suffix)) {
        throw new Error('Suffix must be non-empty single-line text.')
      }

      return new RegExp(
        String.raw`^${text.patterns.normalCharacter}+${RegExp.escape(suffix)}$`,
        text.flags,
      )
    },
    singleLineStartingWith(strings: TemplateStringsArray, ...values: string[]): RegExp {
      const prefix = strings.reduce(
        (result, part, index) => result + part + (values[index] ?? ''),
        '',
      )

      if (!this.singleLine.test(prefix)) {
        throw new Error('Prefix must be non-empty single-line text.')
      }

      return new RegExp(
        String.raw`^${RegExp.escape(prefix)}${text.patterns.normalCharacter}+$`,
        text.flags,
      )
    },
  },
  /**
   * Regex flags do not work in aria snapshot testing.
   */
  ariaSnapshot: {
    text: {
      singleLine: String.raw`/.+/`,
      singleLineOptional: String.raw`/.*/`,
    },
    number: {
      fourDigits: String.raw`/\d{4}/`,
    },
  },
} as const
