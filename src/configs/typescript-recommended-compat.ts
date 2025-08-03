import type { TSESLint } from "@typescript-eslint/utils";

import type { Linter } from "eslint";

/**
 * Rules to override from TypeScript ESLint recommended config for compatibility
 * with Roblox-TS development patterns.
 */
const TS_RECOMMENDED_COMPAT_RULES = {
	"@typescript-eslint/no-array-constructor": "off",
	"@typescript-eslint/no-namespace": "off",
	"@typescript-eslint/no-require-imports": "off",
	"@typescript-eslint/no-unused-vars": "off",
	"@typescript-eslint/triple-slash-reference": "off",
} as const satisfies Linter.RulesRecord;

/**
 * Flat config (ESLint v9+) that overrides TypeScript ESLint recommended rules
 * for compatibility with Roblox-TS development patterns.
 *
 * @example
 *
 * ```ts
 * // eslint.config.js (ESLint v9+)
 * import tseslint from "@typescript-eslint/eslint-plugin";
 * import robloxTs from "eslint-plugin-roblox-ts";
 *
 * export default [
 * 	...tseslint.configs.recommended,
 * 	robloxTs.configs.tsRecommendedCompat,
 * 	robloxTs.configs.recommended,
 * ];
 * ```
 */
export const tsRecommendedCompat = {
	rules: TS_RECOMMENDED_COMPAT_RULES,
} satisfies TSESLint.FlatConfig.Config;

/**
 * Legacy config (ESLint v8) that overrides TypeScript ESLint recommended rules
 * for compatibility with Roblox-TS development patterns.
 *
 * @example
 *
 * ```ts
 * // .eslintrc.js (ESLint v8)
 * module.exports = {
 * 	extends: [
 * 		"@typescript-eslint/recommended",
 * 		"plugin:roblox-ts/tsRecommendedCompatLegacy",
 * 		"plugin:roblox-ts/recommended-legacy",
 * 	],
 * };
 * ```
 */
export const tsRecommendedCompatLegacy = {
	rules: TS_RECOMMENDED_COMPAT_RULES,
} satisfies Linter.LegacyConfig;
