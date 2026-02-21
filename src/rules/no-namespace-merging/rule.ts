import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-namespace-merging";

const NAMESPACE_MERGING_VIOLATION = "namespace-merging-violation";

const messages = {
	[NAMESPACE_MERGING_VIOLATION]:
		"Namespace merging is not supported in roblox-ts. Declare all members in a single namespace.",
};

function checkNamespaceMerging(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.TSModuleDeclaration,
): void {
	if (shouldSkipNode(node)) {
		return;
	}

	const variable = getNamespaceVariable(context, node);
	if (variable === undefined) {
		return;
	}

	const allTypeOnly = variable.defs.every((definition) => {
		return (
			definition.node.type === AST_NODE_TYPES.TSModuleDeclaration &&
			isTypeOnlyNamespace(definition.node)
		);
	});

	if (!allTypeOnly) {
		context.report({
			messageId: NAMESPACE_MERGING_VIOLATION,
			node: node.id,
		});
	}
}

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		"TSModuleDeclaration[global!=true][id.type!='Literal']": function (
			node: TSESTree.TSModuleDeclaration,
		): void {
			checkNamespaceMerging(context, node);
		},
	};
}

function getNamespaceVariable(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.TSModuleDeclaration,
): TSESLint.Scope.Variable | undefined {
	const currentScope = context.sourceCode.getScope(node).upper;
	if (currentScope === null) {
		return undefined;
	}

	const variable = currentScope.set.get((node.id as TSESTree.Identifier).name);
	if (variable === undefined || variable.defs.length <= 1) {
		return undefined;
	}

	return variable;
}

function isTypeOnlyNamespace(node: TSESTree.TSModuleDeclaration): boolean {
	if (!node.body) {
		return true;
	}

	return node.body.body.every((statement) => {
		if (statement.type === AST_NODE_TYPES.ExportNamedDeclaration) {
			if (statement.declaration) {
				return (
					statement.declaration.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
					statement.declaration.type === AST_NODE_TYPES.TSInterfaceDeclaration
				);
			}

			return false;
		}

		return (
			statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
			statement.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
			statement.type === AST_NODE_TYPES.TSModuleDeclaration
		);
	});
}

function shouldSkipNode(node: TSESTree.TSModuleDeclaration): boolean {
	return (
		node.parent.type === AST_NODE_TYPES.TSModuleDeclaration ||
		node.id.type !== AST_NODE_TYPES.Identifier
	);
}

export const noNamespaceMerging = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow merging namespace declarations",
			recommended: true,
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
});
