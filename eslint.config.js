import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-extra-boolean-cast': 'off',
      'no-lonely-if': 'warn',
      'no-trailing-spaces': 'warn',
      'no-multi-spaces': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'space-before-blocks': ['warn', 'always'],
      'object-curly-spacing': ['warn', 'always'],
      indent: ['warn', 2],
      semi: ['warn', 'never'],
      quotes: ['warn', 'single'],
      'array-bracket-spacing': ['warn', 'never'],
      'linebreak-style': 'off',
      'no-unexpected-multiline': 'warn',
      'keyword-spacing': 'warn',
      'comma-dangle': 'warn',
      'comma-spacing': 'warn',
      'arrow-spacing': 'warn',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/'],
  },
])
