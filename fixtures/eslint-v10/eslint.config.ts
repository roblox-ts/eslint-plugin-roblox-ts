// ESLint v10 Flat Config
// Requires @typescript-eslint/parser >=8.0.0
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import robloxTs from 'eslint-plugin-roblox-ts';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,
  // Use the recommended config which now includes parser configuration
  robloxTs.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    }, 
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
]);
