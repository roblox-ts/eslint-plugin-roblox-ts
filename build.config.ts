import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	clean: true,
	declaration: "node16",
	entries: ["src/index"],
	externals: [
		"@typescript-eslint/utils",
		"@typescript-eslint/utils/eslint-utils",
		"@typescript-eslint/type-utils",
		"typescript",
	],
	rollup: {
		inlineDependencies: ["ts-api-utils"],
	},
});
