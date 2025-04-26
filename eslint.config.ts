import style, { GLOB_TESTS } from "@isentinel/eslint-config";

export default style(
	{
		pnpm: true,
		roblox: false,
		type: "package",
		typescript: {
			parserOptions: {
				project: "tsconfig.json",
			},
			tsconfigPath: "tsconfig.json",
		},
	},
	{
		ignores: [".eslint-doc-generatorrc.ts"],
	},
	{
		files: GLOB_TESTS,
		rules: {
			"max-lines": "off",
			"ts/no-non-null-assertion": "off",
		},
	},
);
