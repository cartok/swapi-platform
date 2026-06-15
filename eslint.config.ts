import { builtinModules } from 'node:module'
import { isMainThread, threadId } from 'node:worker_threads'

import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import angular from 'angular-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import type { ESLintRules } from 'eslint/rules'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import ts from 'typescript'
import type { ConfigWithExtends } from 'typescript-eslint'
import tseslint from 'typescript-eslint'

if (isMainThread) {
  console.log('ESLint executing with TypeScript version:', ts.version)
} else {
  console.log(`ESLint worker ${threadId}`)
}

type TypedConfig = Omit<ConfigWithExtends, 'rules'> & {
  rules?: Partial<ESLintRules>
}

function typedConfig<const config extends TypedConfig>(config: config): config {
  return config
}

export default defineConfig([
  globalIgnores([
    '**/.cache/**',
    '**/.wrangler/**',
    '**/blob-report/**',
    '**/dist/**',
    '**/docs/**',
    '**/generated/**',
    '**/node_modules/**',
    '**/playwright-report/**',
    '**/playwright/**',
    '**/test-results/**',
  ]),
  typedConfig({
    files: ['**/*.{ts,mts,cts}', './eslint.config.mjs'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      eslintConfigPrettier,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'simple-import-sort': simpleImportSort,
      import: eslintPluginImport,
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/first': 'error',
      'import/newline-after-import': [
        'error',
        { count: 1, exactCount: true, considerComments: true },
      ],
      'import/no-duplicates': ['error', { 'prefer-inline': false }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
      'no-duplicate-imports': 'off',
      'no-empty-pattern': 'error',
      'no-empty': 'warn',
      'no-useless-rename': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          enableAutofixRemoval: {
            imports: true,
          },
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  }),
  typedConfig({
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  }),
  typedConfig({
    files: ['**/*.{js,mjs,cjs}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.disableTypeChecked,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  }),
  typedConfig({
    files: ['./packages/client/vite.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  }),
  typedConfig({
    files: ['./packages/client/src/**/*.ts'],
    extends: [angular.configs.tsAll],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-class-suffix': ['off'],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/use-injectable-provided-in': ['off'],
    },
  }),
  typedConfig({
    files: [
      './packages/client/src/app/components/link-list/link-list-item/link-list-item.ts',
    ],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  }),
  typedConfig({
    files: ['./packages/client/src/**/*.html'],
    extends: [angular.configs.templateAll, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/i18n': [
        'off',
        {
          ignoreAttributes: ['img[decoding]'],
        },
      ],
      '@angular-eslint/template/no-inline-styles': 'off',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/cyclomatic-complexity': [
        'error',
        {
          maxComplexity: 12,
        },
      ],
    },
  }),
  typedConfig({
    files: ['./packages/client/src/app/components/image-slider/**/*.ts'],
    rules: {
      '@angular-eslint/no-developer-preview': 'off',
    },
  }),
  typedConfig({
    files: [
      './packages/client/src/app/api/swapi/**/*.ts',
      './packages/client/src/app/http/http-retry.interceptor.ts',
    ],
    rules: {
      '@angular-eslint/no-experimental': ['off'],
    },
  }),
  typedConfig({
    files: ['./packages/worker/worker-configuration.d.ts'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  }),
  typedConfig({
    files: ['./packages/hono/**/*.ts', './packages/worker/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*'],
              message: 'Node.js built-in modules are not allowed in this package.',
            },
            {
              group: builtinModules.filter(
                (moduleName) =>
                  !moduleName.startsWith('_') && !moduleName.startsWith('node:'),
              ),
              message: 'Node.js built-in modules are not allowed in this package.',
            },
          ],
        },
      ],
    },
  }),
  typedConfig({
    files: ['./packages/e2e/src/**/*.ts'],
    ignores: ['./packages/e2e/src/extensions/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['expect', 'test'],
              message: 'Import `expect` and `test` from `#internal/extensions/index`.',
            },
          ],
        },
      ],
    },
  }),
])
