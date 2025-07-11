import style from "@isentinel/eslint-config";

import eslintPlugin from "eslint-plugin-eslint-plugin";

export default style(
	{
		markdown: false,
		pnpm: true,
		roblox: false,
		rules: {
			"antfu/consistent-list-newline": [
				"error",
				{
					CallExpression: false,
				},
			],
		},
		type: "package",
	},
	{
		ignores: [".eslint-doc-generatorrc.ts", "fixture/**", "scripts/template/**"],
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
