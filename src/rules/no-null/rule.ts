import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRobloxRule, type RobloxRuleListener } from "../../util";

export const RULE_NAME = "no-null";

const NULL_VIOLATION = "null-violation";

const messages = {
	[NULL_VIOLATION]: "Usage of 'null' is not allowed. Use 'undefined' instead.",
};

function createOnce(context: Readonly<TSESLint.RuleContext<string, []>>): RobloxRuleListener {
	return {
		Literal(node) {
			if (node.value === null) {
				replaceNull(context, node);
			}
		},

		TSNullKeyword(node) {
			replaceNull(context, node);
		},
	};
}

function replaceNull(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.Node,
): void {
	context.report({
		fix: (fixer) => fixer.replaceText(node, "undefined"),
		messageId: NULL_VIOLATION,
		node,
	});
}

export const noNull = createRobloxRule({
	name: RULE_NAME,
	createOnce,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow usage of the `null` keyword",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
});
