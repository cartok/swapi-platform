// @ts-check
import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import angular from 'angular-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig(
  globalIgnores(['**/dist/**', '**/docs/**', '**/generated/**', '**/node_modules/**']),
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
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          // TODO: Umstellen. Zumindest im vscode workflow "gibt es da Probleme mit".
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
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
    files: ['./packages/client/src/**/*.html'],
    extends: [angular.configs.templateAll],
    rules: {
      '@angular-eslint/template/i18n': 'off',
      '@angular-eslint/template/no-inline-styles': 'off',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/cyclomatic-complexity': [
        'error',
        {
          maxComplexity: 10,
        },
      ],
    },
  },
  {
    files: ['./packages/client/src/app/api/swapi/**/*.ts'],
    rules: {
      '@angular-eslint/no-experimental': ['off'],
    },
  },
)
