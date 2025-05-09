// ESLint v9 Flat Config
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import robloxTs from 'eslint-plugin-roblox-ts';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'roblox-ts': robloxTs,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      
      // Roblox-TS plugin rules - covering different rule types
      'roblox-ts/no-null': 'error',
      'roblox-ts/no-object-math': 'error',
      'roblox-ts/no-array-pairs': 'error',
      'roblox-ts/lua-truthiness': 'error',
      'roblox-ts/no-any': ['error', { fixToUnknown: true }],
      'roblox-ts/no-enum-merging': 'error',
      'roblox-ts/no-invalid-identifier': 'error',
      'roblox-ts/prefer-task-library': 'error',
      'roblox-ts/size-method': 'error',
      'roblox-ts/no-for-in': 'error',
      'roblox-ts/no-private-identifier': 'error',
      'roblox-ts/no-get-set': 'error',
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