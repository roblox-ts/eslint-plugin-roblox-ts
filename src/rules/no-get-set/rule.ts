import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-get-set";

const GET_SET_VIOLATION = "get-set-violation";

const messages = {
	[GET_SET_VIOLATION]:
		"Getters and Setters are not supported for performance reasons. Please use a normal method instead.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	function checkMethodDefinition(
		nodes: Array<TSESTree.ClassElement | TSESTree.ObjectLiteralElementLike>,
	): void {
		for (const node of nodes) {
			if (
				(node.type === AST_NODE_TYPES.MethodDefinition ||
					node.type === AST_NODE_TYPES.Property) &&
				(node.kind === "get" || node.kind === "set")
			) {
				context.report({
					fix: fixer => fixer.removeRange([node.key.range[0] - 1, node.key.range[0]]),
					messageId: GET_SET_VIOLATION,
					node,
				});
			}
		}
	}

	return {
		ClassBody: node => {
			checkMethodDefinition(node.body);
		},
		ObjectExpression: node => {
			checkMethodDefinition(node.properties);
		},
	};
}

export const noGetSet = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallows getters and setters",
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
