import type { TSESLint } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-value-typeof";

const TYPEOF_VALUE_VIOLATION = "typeof-value-violation";

const messages = {
	[TYPEOF_VALUE_VIOLATION]:
		"'typeof' operator is not supported! Use `typeIs(value, type)` or `typeOf(value)` instead.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		UnaryExpression(node) {
			if (node.operator === "typeof") {
				context.report({ messageId: TYPEOF_VALUE_VIOLATION, node });
			}
		},
	};
}

export const noValueTypeof = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow using `typeof` to check for value types",
			recommended: true,
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
