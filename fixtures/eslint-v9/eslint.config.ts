// ESLint v9 Flat Config
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import robloxTs from 'eslint-plugin-roblox-ts-x';

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
      'roblox-ts-x': robloxTs,
    },
    rules: {
      // TypeScript ESLint rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for this example
      
      // Roblox-TS plugin rules - covering different rule types
      'roblox-ts-x/no-null': 'error',                    // Fixable rule
      'roblox-ts-x/no-object-math': 'error',            // Fixable + Type-checking rule
      'roblox-ts-x/no-array-pairs': 'error',            // Type-checking rule
      'roblox-ts-x/lua-truthiness': 'error',            // Type-checking rule
      'roblox-ts-x/no-any': ['error', { fixToUnknown: true }], // Fixable + Suggestion rule
      'roblox-ts-x/no-enum-merging': 'error',           // Error-only rule
      'roblox-ts-x/no-invalid-identifier': 'error',     // Error-only rule
      'roblox-ts-x/prefer-task-library': 'error',       // Fixable rule
      'roblox-ts-x/size-method': 'error',               // Fixable + Type-checking rule
      'roblox-ts-x/no-for-in': 'error',                 // Fixable rule
      'roblox-ts-x/no-private-identifier': 'error',     // Fixable rule
      'roblox-ts-x/no-get-set': 'error',                // Fixable rule
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