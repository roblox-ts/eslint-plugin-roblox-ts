import style, { GLOB_TESTS } from "@isentinel/eslint-config";

// @ts-expect-error -- eslint-plugin-eslint-plugin is not typed
import eslintPlugin from "eslint-plugin-eslint-plugin";

export default style(
	{
		pnpm: true,
		roblox: false,
		type: "package",
		typescript: {
			tsconfigPath: "tsconfig.json",
		},
	},
	{
		ignores: [".eslint-doc-generatorrc.ts", "fixture/**", "scripts/template/**"],
	},
	{
		files: GLOB_TESTS,
		rules: {
			"max-lines": "off",
			"ts/no-non-null-assertion": "off",
		},
	},
	/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-argument, ts/no-unsafe-member-access -- No types. */
	{
		...eslintPlugin.configs["flat/all-type-checked"],
		rules: {
			...eslintPlugin.configs["flat/all-type-checked"].rules,
			"eslint-plugin/meta-property-ordering": "off",
			"eslint-plugin/no-meta-schema-default": "off",
			"eslint-plugin/require-meta-docs-description": [
				"error",
				{
					pattern: "^(Enforce|Require|Disallow).*[^\.!]$",
				},
			],
			"eslint-plugin/require-meta-docs-url": "off",
		},
	},
	/* eslint-enable */
);
