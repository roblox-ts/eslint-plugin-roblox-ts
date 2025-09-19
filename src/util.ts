import { RuleCreator } from "@typescript-eslint/utils/eslint-utils";

export const TYPESCRIPT_FILES = ["**/*/*.?([cm])ts", "**/*/*.?([cm])tsx"];

export interface PluginDocumentation {
	description: string;
	recommended?: boolean;
	requiresTypeChecking: boolean;
}

export const createEslintRule = RuleCreator<PluginDocumentation>((name) => {
	return `https://github.com/roblox-ts/eslint-plugin-roblox-ts/tree/main/src/rules/${name}/documentation.md`;
});
