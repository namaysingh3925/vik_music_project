import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
      rules: {
        // allow importing React even when it's unused (automatic JSX runtime)
        'no-unused-vars': ['error', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
        // disable strict setState-in-effect rule (many components intentionally set state)
        'react-hooks/set-state-in-effect': 'off',
        // allow exporting non-component helpers in context/provider files
        'react-refresh/only-export-components': 'off',
      },
  },
    // Backend overrides: lint Node files with Node globals
    {
      files: ['backend/**/*.{js,cjs,mjs}'],
      languageOptions: {
        globals: globals.node,
        parserOptions: { ecmaVersion: 'latest' },
      },
    },
])
