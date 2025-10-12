import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/eslint.config.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
          // Cloudflare Workers globals
          URL: 'readonly',
          Response: 'readonly',
          Request: 'readonly',
          Headers: 'readonly',
          console: 'readonly',
          fetch: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off', // Allow console in Cloudflare Workers
      'no-undef': 'off', // Turn off undef errors for globals
      'no-extra-boolean-cast': 'warn',
    },
  },
  ...(astro.configs['flat/recommended'] as any),
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: (astro as any).parser,
      parserOptions: {
        parser: typescriptParser,
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {
      ...(astro.configs.recommended as any).rules,
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.astro/',
      '*.config.js',
      '*.config.mjs',
      '.wrangler/',
    ],
  },
];
