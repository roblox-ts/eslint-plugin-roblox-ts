import type { GenerateOptions } from "eslint-doc-generator";

const config: GenerateOptions = {
	ignoreConfig: ["recommended"],
	ignoreDeprecatedRules: true,
	pathRuleDoc: "./src/rules/{name}/documentation.md",
	pathRuleList: "./README.md",
	ruleDocTitleFormat: "desc",
	ruleListColumns: ["name", "description", "fixable", "hasSuggestions", "requiresTypeChecking"],
	urlConfigs: "https://github.com/roblox-ts/eslint-plugin-roblox-ts",
};

export default config;
