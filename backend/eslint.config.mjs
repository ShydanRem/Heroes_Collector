// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      // --- Guardrail going forward: real-bug rules stay errors ---
      'no-var': 'error',
      'prefer-const': 'error',
      'no-fallthrough': 'error',
      'no-unreachable': 'error',
      // Module augmentation (es. `declare global { namespace Express {...} }`) è idiomatica.
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],

      // --- Existing debt (review acknowledges pervasive `any`): warn, don't block ---
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
  {
    // Tests may use loose typing for fixtures.
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
