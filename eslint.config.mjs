import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Base recommended configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Globally ignored folders (replaces .eslintignore)
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**', '**/*.js', '**/*.mjs']
  },

  // Specific rules for TypeScript files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // Dialed down to 'warn' to be permissive and keep workflow unblocked
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' } // Pro-tip: ignore variables starting with an underscore
      ],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
)
