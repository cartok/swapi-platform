// @ts-check
/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'all',
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: './packages/client/src/**/*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
}

export default config
