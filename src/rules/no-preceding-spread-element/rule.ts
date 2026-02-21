import type { TSESLint } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { isArrayLiteralExpression, isObjectLiteralExpression } from "typescript";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-preceding-spread-element";

const PRECEDING_SPREAD_VIOLATION = "preceding-rest-violation";

const messages = {
	[PRECEDING_SPREAD_VIOLATION]: "Spread element must come last in a list of arguments!",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	return {
		SpreadElement(node) {
			const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
			const { parent } = tsNode;
			if (
				!isArrayLiteralExpression(parent) &&
				!isObjectLiteralExpression(parent) &&
				parent.arguments &&
				parent.arguments[parent.arguments.length - 1] !== tsNode
			) {
				context.report({
					messageId: PRECEDING_SPREAD_VIOLATION,
					node,
				});
			}
		},
	};
}

export const noPrecedingSpreadElement = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow spread elements not last in a list of arguments",
			recommended: true,
			requiresTypeChecking: true,
		},
		messages,
		schema: [],
		type: "problem",
	},
});
