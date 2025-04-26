import { RuleCreator } from "@typescript-eslint/utils/eslint-utils";

export interface PluginDocumentation {
	description: string;
	recommended?: "all" | "recommended" | "strict" | "stylistic";
	requiresTypeChecking: boolean;
}

export const createEslintRule = RuleCreator<PluginDocumentation>(name => {
	return `https://github.com/christopher-buss/eslint-plugin-roblox-ts-x/tree/main/src/rules/${name}/documentation.md`;
});
