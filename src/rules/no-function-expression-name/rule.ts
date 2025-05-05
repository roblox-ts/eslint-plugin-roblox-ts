import type { TSESLint } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-function-expression-name";

const FUNCTION_EXPRESSION_VIOLATION = "function-expression-violation";

const messages = {
	[FUNCTION_EXPRESSION_VIOLATION]: "Function expression names are not supported!",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		FunctionExpression(node) {
			const { id } = node;
			if (id === null) {
				return;
			}

			const variable = context.sourceCode.getScope(node).set.get(id.name);
			const referenced = variable?.references.some(ref => ref.identifier !== id) ?? false;

			context.report({
				fix: referenced ? null : fixer => fixer.removeRange([id.range[0] - 1, id.range[1]]),
				messageId: FUNCTION_EXPRESSION_VIOLATION,
				node: id,
			});
		},
	};
}

export const noFunctionExpressionName = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow the use of function expression names",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
