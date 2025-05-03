import type { TSESLint } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-for-in";

const FOR_IN_VIOLATION = "for-in-violation";

const messages = {
	[FOR_IN_VIOLATION]:
		"For-in loops are forbidden because it always types the iterator variable as `string`. Use for-of or array.forEach instead.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		ForInStatement(node) {
			context.report({
				fix: fix => fix.replaceTextRange([node.left.range[1], node.right.range[0]], " of "),
				messageId: FOR_IN_VIOLATION,
				node,
			});
		},
	};
}

export const noForIn = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallows iterating with a for-in loop",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
