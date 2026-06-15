// @ts-check
/**
 * @see https://prettier.io/docs/en/configuration.html
 * Supported file types:
 * - JavaScript / TypeScript:   .js, .ts, .jsx, .tsx, .mjs, .cjs, .mts, .cts
 * - Web & Markup:              .html, .vue, .md
 * - Styles & Layout:           .css, .scss, .less, .mjml
 * - Templating:                .json, .yaml, .yml, .graphql
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
