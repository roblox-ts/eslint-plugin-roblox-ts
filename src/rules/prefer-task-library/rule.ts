import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import assert from "node:assert";

import { createEslintRule } from "../../util";

export const RULE_NAME = "prefer-task-library";

const PREFER_TASK = "prefer-task-library";

const messages = {
	[PREFER_TASK]: "Use task.{{fn}}() instead of {{fn}}() for better performance.",
};

const FN_NAMES = new Set(["delay", "spawn", "wait"]);

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		CallExpression(node: TSESTree.CallExpression) {
			if (node.callee.type !== AST_NODE_TYPES.Identifier || !FN_NAMES.has(node.callee.name)) {
				return;
			}

			context.report({
				data: { fn: node.callee.name },
				fix(fixer) {
					assert(node.callee.type === AST_NODE_TYPES.Identifier);
					return fixer.replaceText(node.callee, `task.${node.callee.name}`);
				},
				messageId: PREFER_TASK,
				node: node.callee,
			});
		},
	};
}

export const preferTaskLibrary = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description:
				"Enforces use of task.wait(), task.delay(), and task.spawn() instead of global wait(), delay(), and spawn().",
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
