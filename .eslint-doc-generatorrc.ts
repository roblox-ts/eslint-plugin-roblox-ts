
import type { GenerateOptions } from "eslint-doc-generator";

const config: GenerateOptions = {
	ignoreDeprecatedRules: true,
	ruleDocTitleFormat: 'desc',
	ignoreConfig: [
		"recommended",
	],
	ruleListColumns: [
		'name',
		'description',
		'fixable',
		'hasSuggestions',
		'requiresTypeChecking',
	],
	urlConfigs: 'https://github.com/christopher-buss/eslint-plugin-roblox-ts-x',
	pathRuleDoc: './src/rules/{name}/documentation.md',
	pathRuleList: './README.md',
};
 
export default config;