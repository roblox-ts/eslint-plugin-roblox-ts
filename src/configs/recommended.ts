import type { TSESLint } from "@typescript-eslint/utils";

import type { Linter } from "eslint";

import { allRules, plugin, PLUGIN_NAME } from "../plugin";
import { createConfig } from "../utils/create-config";

// Create the base configurations with proper file constraints
const { flat: baseFlat, legacy: baseLegacy } = createConfig(allRules);

/**
 * Recommended configuration for ESLint v9+ (flat config). Enables all plugin
 * rules but only applies them to TypeScript source files, not root-level config files.
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
export const recommended = {
	...baseFlat,
	plugins: {
		[PLUGIN_NAME]: plugin,
	},
} satisfies TSESLint.FlatConfig.Config;

/**
 * Recommended configuration for legacy ESLint v8. Enables all plugin rules
 * but only applies them to TypeScript source files, not root-level config files.
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
export const recommendedLegacy = {
	...baseLegacy,
	plugins: [PLUGIN_NAME],
} satisfies Linter.LegacyConfig;
