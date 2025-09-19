import type { CompatibleConfig } from "../utils/compatability-types";
import { eslintCompat, eslintCompatLegacy } from "./eslint-compat";
import { recommended, recommendedLegacy } from "./recommended";
import { tsRecommendedCompat, tsRecommendedCompatLegacy } from "./typescript-recommended-compat";

export const configs = {
	/**
	 * ESLint core rules for Roblox-TS compatibility. These rules help prevent
	 * JavaScript patterns that are incompatible with Roblox-TS.
	 *
	 * @example
	 *
	 * ```ts
	 * // eslint.config.js
	 * import robloxTs from "eslint-plugin-roblox-ts";
	 *
	 * export default [{ rules: robloxTs.configs.eslintCompat }];
	 * ```
	 */
	"eslintCompat": eslintCompat as CompatibleConfig,

	/**
	 * ESLint core rules for Roblox-TS compatibility. These rules help prevent
	 * JavaScript patterns that are incompatible with Roblox-TS.
	 *
	 * @example
	 *
	 * ```ts
	 * // .eslintrc.js
	 * module.exports = {
	 * 	extends: ["plugin:roblox-ts/eslint-compat-legacy"],
	 * };
	 * ```
	 */
	"eslintCompatLegacy": eslintCompatLegacy as CompatibleConfig,

	/**
	 * Recommended configuration for ESLint v9+ (flat config). Enables all
	 * plugin rules.
	 *
	 * @example
	 *
	 * ```ts
	 * // eslint.config.js
	 * import roblox from "eslint-plugin-roblox-ts";
	 *
	 * export default [roblox.configs.recommended];
	 * ```
	 */
	"recommended": recommended as CompatibleConfig,

	/**
	 * Recommended configuration for legacy ESLint v8. Enables all plugin rules.
	 *
	 * @example
	 *
	 * ```ts
	 * // .eslintrc.js
	 * module.exports = {
	 * 	extends: ["plugin:roblox-ts/recommended-legacy"],
	 * };
	 * ```
	 */
	"recommended-legacy": recommendedLegacy as CompatibleConfig,

	/**
	 * Configuration for legacy ESLint v8 that provides TypeScript ESLint
	 * recommended compatibility overrides for Roblox-TS development patterns.
	 *
	 * @example
	 *
	 * ```ts
	 * // .eslintrc.js
	 * module.exports = {
	 * 	extends: [
	 * 		"@typescript-eslint/recommended",
	 * 		"plugin:roblox-ts/tsRecommendedCompatLegacy",
	 * 		"plugin:roblox-ts/recommended-legacy",
	 * 	],
	 * };
	 * ```
	 */
	"ts-recommended-compat-legacy": tsRecommendedCompatLegacy as CompatibleConfig,

	/**
	 * Configuration for ESLint v9+ (flat config) that provides TypeScript
	 * ESLint recommended compatibility overrides for Roblox-TS development
	 * patterns.
	 *
	 * @example
	 *
	 * ```ts
	 * // eslint.config.js
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
	"tsRecommendedCompat": tsRecommendedCompat as CompatibleConfig,
};
