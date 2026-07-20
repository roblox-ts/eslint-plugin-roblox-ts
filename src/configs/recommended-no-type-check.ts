import tsParser from "@typescript-eslint/parser";
import type { TSESLint } from "@typescript-eslint/utils";

import type { Linter } from "eslint";

import { nonTypeAwareRules, plugin, PLUGIN_NAME } from "../plugin";
import { createConfig, TYPESCRIPT_FILES } from "../utils/create-config";

const { flat: baseFlat, legacy: baseLegacy } = createConfig(nonTypeAwareRules);

/**
 * TypeScript parser configuration without project service.
 *
 * This config enables no type-aware rules, so it skips `projectService` — that
 * is what makes it cheap to run.
 */
const parserWithoutTypes = {
	files: TYPESCRIPT_FILES,
	languageOptions: {
		parser: tsParser,
		parserOptions: {
			ecmaVersion: 2018,
			jsx: true,
		},
	},
} satisfies TSESLint.FlatConfig.Config;

/**
 * Recommended configuration for ESLint v9+ (flat config) that enables only the
 * rules which run without type information.
 *
 * Skips the TypeScript project service, so it is substantially cheaper than the
 * full recommended config at the cost of the type-aware rules.
 *
 * @example
 *
 * ```ts
 * // eslint.config.js
 * import roblox from "eslint-plugin-roblox-ts";
 *
 * export default [roblox.configs.recommendedNoTypeCheck];
 * ```
 */
export const recommendedNoTypeCheck = {
	...baseFlat,
	...parserWithoutTypes,
	plugins: {
		[PLUGIN_NAME]: plugin,
	},
} satisfies TSESLint.FlatConfig.Config;

/**
 * Configuration for legacy ESLint v8 that enables only the rules which run
 * without type information.
 *
 * @example
 *
 * ```ts
 * // .eslintrc.js
 * module.exports = {
 * 	extends: ["plugin:roblox-ts/recommended-no-type-check-legacy"],
 * };
 * ```
 */
export const recommendedNoTypeCheckLegacy: Linter.LegacyConfig = {
	...baseLegacy,
	overrides: [
		{
			files: TYPESCRIPT_FILES,
			parser: "@typescript-eslint/parser",
			parserOptions: {
				ecmaVersion: 2018,
				jsx: true,
			},
		},
	],
	plugins: [PLUGIN_NAME],
} satisfies Linter.LegacyConfig;
