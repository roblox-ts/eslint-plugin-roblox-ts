import type { TSRecommendedRules } from "../types/generated";
import { createConfig } from "../utils/create-config";

/** TypeScript ESLint rules to override for Roblox-TS compatibility. */
const TS_RECOMMENDED_OVERRIDES = {
	"@typescript-eslint/no-array-constructor": "off",
	"@typescript-eslint/no-namespace": "off",
	"@typescript-eslint/no-require-imports": "off",
	"@typescript-eslint/no-unused-vars": "off",
	"@typescript-eslint/triple-slash-reference": "off",
} as const satisfies Partial<Record<TSRecommendedRules, "off">>;

const { flat, legacy } = createConfig(TS_RECOMMENDED_OVERRIDES);

/**
 * Flat config (ESLint v9+) that provides TypeScript ESLint recommended
 * compatibility for Roblox-TS development patterns. Includes both ESLint core
 * rules and TypeScript rule overrides.
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
export const tsRecommendedCompat = flat;

/**
 * Legacy config (ESLint v8) that provides TypeScript ESLint recommended
 * compatibility for Roblox-TS development patterns. Includes both ESLint core
 * rules and TypeScript rule overrides.
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
export const tsRecommendedCompatLegacy = legacy;
