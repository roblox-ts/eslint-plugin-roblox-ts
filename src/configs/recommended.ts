import tsParser from "@typescript-eslint/parser";
import type { TSESLint } from "@typescript-eslint/utils";

import type { Linter } from "eslint";

import { allRules, plugin, PLUGIN_NAME } from "../plugin";
import { createConfig, TYPESCRIPT_FILES } from "../utils/create-config";

const { flat: baseFlat, legacy: baseLegacy } = createConfig(allRules);

/**
 * TypeScript parser configuration with project service support.
 *
 * @note Requires @typescript-eslint/parser >=8.0.0.
 *
 * Can be used standalone or extended with other configurations.
 */
export const parser = {
	files: TYPESCRIPT_FILES,
	languageOptions: {
		parser: tsParser,
		parserOptions: {
			ecmaVersion: 2018,
			jsx: true,
			projectService: {
				allowDefaultProject: ["*.ts"],
				defaultProject: "./tsconfig.json",
			},
		},
	},
} satisfies TSESLint.FlatConfig.Config;

/**
 * Recommended configuration for ESLint v9+ (flat config). Enables all plugin
 * rules but only applies them to TypeScript source files, not root-level config
 * files.
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
	...parser,
	plugins: {
		[PLUGIN_NAME]: plugin,
	},
} satisfies TSESLint.FlatConfig.Config;

/**
 * TypeScript parser configuration for ESLint v8 (legacy config) with
 * traditional project option.
 *
 * @note Compatible with @typescript-eslint/parser >=6.0.0.
 *
 * Can be used standalone or extended with other configurations.
 */
export const legacyParserConfig = {
	overrides: [
		{
			files: TYPESCRIPT_FILES,
			parser: "@typescript-eslint/parser",
			parserOptions: {
				ecmaVersion: 2018,
				jsx: true,
				project: true,
			},
		},
	],
} satisfies Linter.LegacyConfig;

/**
 * Recommended configuration for legacy ESLint v8. Enables all plugin rules but
 * only applies them to TypeScript source files, not root-level config files.
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
export const recommendedLegacy: Linter.LegacyConfig = {
	...baseLegacy,
	...legacyParserConfig,
	plugins: [PLUGIN_NAME],
} satisfies Linter.LegacyConfig;
