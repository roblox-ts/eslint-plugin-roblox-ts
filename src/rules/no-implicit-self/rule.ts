import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-implicit-self";

const COLON_VIOLATION = "violation";

const messages = {
	[COLON_VIOLATION]: "Enforce the use of `.` instead of `:` for method calls",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		["LabeledStatement[body.type='ExpressionStatement'][body.expression.type='CallExpression']," +
		"LabeledStatement[body.expression.type='MemberExpression']"]: (
			node: TSESTree.LabeledStatement,
		) => {
			const { sourceCode } = context;
			const { body, label } = node;

			const bodyText = sourceCode.getText(body);
			const labelText = sourceCode.getText(label);

			// Check if the label is directly followed by a colon (no whitespace)
			const between = sourceCode.text.slice(label.range[1], body.range[0]);
			if (/^:\s/g.test(between)) {
				return;
			}

			const fixedText = `${labelText}.${bodyText}`;
			context.report({
				fix(fixer) {
					return fixer.replaceText(node, fixedText);
				},
				messageId: COLON_VIOLATION,
				node,
			});
		},
	};
}

export const noImplicitSelf = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Enforce the use of `.` instead of `:` for method calls",
			recommended: false,
			requiresTypeChecking: false,
		},
		fixable: "code",
		hasSuggestions: false,
		messages,
		schema: [],
		type: "problem",
	},
});
