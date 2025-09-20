// ESLint v9 Flat Config
// Requires @typescript-eslint/parser >=8.0.0
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import robloxTs from 'eslint-plugin-roblox-ts';

export default [
  js.configs.recommended,
  // Use the recommended config which now includes parser configuration
  robloxTs.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': typescript,
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
];