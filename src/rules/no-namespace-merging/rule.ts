import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-namespace-merging";

const NAMESPACE_MERGING_VIOLATION = "namespace-merging-violation";

const messages = {
	[NAMESPACE_MERGING_VIOLATION]:
		"Namespace merging is not supported in roblox-ts. Declare all members in a single namespace.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		"TSModuleDeclaration[global!=true][id.type!='Literal']"(
			node: TSESTree.TSModuleDeclaration,
		): void {
			if (
				node.parent.type === AST_NODE_TYPES.TSModuleDeclaration ||
				node.id.type !== AST_NODE_TYPES.Identifier
			) {
				return;
			}

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
				messageId: NAMESPACE_MERGING_VIOLATION,
				node: node.id,
			});
		},
	};
}

export const noNamespaceMerging = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallows merging namespace declarations.",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
