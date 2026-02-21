import type { TSESLint } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-enum-merging";

const ENUM_MERGING_VIOLATION = "enum-merging-violation";

const messages = {
	[ENUM_MERGING_VIOLATION]:
		"Enum merging is not supported in roblox-ts. Declare all members in a single enum.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		TSEnumDeclaration(node) {
			const currentScope = context.sourceCode.getScope(node).upper;
			if (currentScope === null) {
				return;
			}

			const variable = currentScope.set.get(node.id.name);
			if (variable === undefined) {
				return;
			}

			if (variable.defs.length <= 1) {
				return;
			}

			context.report({
				messageId: ENUM_MERGING_VIOLATION,
				node: node.id,
			});
		},
	};
}

export const noEnumMerging = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow merging enum declarations",
			recommended: true,
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
});
