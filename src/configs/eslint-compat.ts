import type { Linter } from "eslint";

import { createConfig } from "../utils/create-config";

/**
 * ESLint core rules that should be enabled for Roblox-TS compatibility. These
 * rules help prevent JavaScript patterns that are incompatible with Roblox-TS.
 */
export const ESLINT_COMPAT = {
	"eqeqeq": "error",
	"no-debugger": "error",
	"no-labels": "error",
	"no-sequences": "error",
	"no-sparse-arrays": "warn",
	"no-var": "error",
	"no-void": "error",
	"no-with": "error",
	"prefer-rest-params": "error",
} as const satisfies Linter.RulesRecord;

// Create config already includes eslintCompat rules
const { flat, legacy } = createConfig();

/**
 * Flat config (ESLint v9+) that provides ESLint core rules for Roblox-TS
 * compatibility. Includes both ESLint core rules and TypeScript rule
 * overrides.
 *
 * @example
 *
 * ```ts
 * // eslint.config.js (ESLint v9+)
 * import robloxTs from "eslint-plugin-roblox-ts";
 *
 * export default [robloxTs.configs.eslintCompat];
 * ```
 */
export const eslintCompat = flat;

/**
 * Legacy config (ESLint v8) that provides ESLint core rules for Roblox-TS
 * compatibility. Includes both ESLint core rules and TypeScript rule
 * overrides.
 *
 * @example
 *
 * ```ts
 * // .eslintrc.js (ESLint v8)
 * module.exports = {
 * 	extends: ["plugin:roblox-ts/eslint-compat-legacy"],
 * };
 * ```
 */
export const eslintCompatLegacy = legacy;
