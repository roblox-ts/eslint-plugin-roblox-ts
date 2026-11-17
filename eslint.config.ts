import style, { GLOB_MARKDOWN } from "@isentinel/eslint-config";

export default style(
	{
		eslintPlugin: true,
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
		typescript: {
			// tsconfig.json includes every root file except dotfiles.
			outOfProjectFiles: [".*.ts"],
		},
	},
	{
		ignores: ["fixtures/**", "scripts/template/**", GLOB_MARKDOWN],
	},
	{
		rules: {
			"eslint-plugin/no-meta-schema-default": "off",
		},
	},
);
