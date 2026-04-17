// @ts-check
import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import angular from 'angular-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import stylistic from '@stylistic/eslint-plugin'
import eslintPluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig(
  globalIgnores([
    '**/.cache/**',
    '**/dist/**',
    '**/docs/**',
    '**/generated/**',
    '**/node_modules/**',
  ]),
  {
    files: ['**/*.{ts,mts,cts}'],
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
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.disableTypeChecked,
      eslintConfigPrettier,
    ],
  },
  {
    files: ['./packages/client/vite.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
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
    },
  },
  {
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
  },
  {
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
  },
  {
    files: ['./packages/client/src/app/components/image-slider/**/*.ts'],
    rules: {
      '@angular-eslint/no-developer-preview': 'off',
    },
  },
  {
    files: ['./packages/client/src/app/api/swapi/**/*.ts'],
    rules: {
      '@angular-eslint/no-experimental': ['off'],
    },
  },
)
