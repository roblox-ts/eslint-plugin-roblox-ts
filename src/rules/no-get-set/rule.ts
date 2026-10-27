import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ASTUtils } from "@typescript-eslint/utils";

import { createRobloxRule, type RobloxRuleListener } from "../../util";

export const RULE_NAME = "no-get-set";

const GET_SET_VIOLATION = "get-set-violation";

const messages = {
	[GET_SET_VIOLATION]:
		"Getters and Setters are not supported for performance reasons. Please use a normal method instead.",
};

type Accessor = TSESTree.MethodDefinition | TSESTree.Property;

function checkMethodDefinitions(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	nodes: Array<TSESTree.ClassElement | TSESTree.ObjectLiteralElementLike>,
): void {
	const accessors = nodes.filter((node): node is Accessor => {
		return (
			(node.type === AST_NODE_TYPES.MethodDefinition ||
				node.type === AST_NODE_TYPES.Property) &&
			(node.kind === "get" || node.kind === "set")
		);
	});
	for (const node of accessors) {
		context.report({
			fix: hasAccessorPair(node, accessors)
				? null
				: (fixer) => removeAccessorKeyword(context.sourceCode, node, fixer),
			messageId: GET_SET_VIOLATION,
			node,
		});
	}
}

function createOnce(context: Readonly<TSESLint.RuleContext<string, []>>): RobloxRuleListener {
	return {
		ClassBody: (node) => {
			checkMethodDefinitions(context, node.body);
		},
		ObjectExpression: (node) => {
			checkMethodDefinitions(context, node.properties);
		},
	};
}

function getAccessorName(node: Accessor): null | string {
	return node.key.type === AST_NODE_TYPES.PrivateIdentifier
		? node.key.name
		: ASTUtils.getPropertyName(node);
}

function hasAccessorPair(node: Accessor, accessors: Array<Accessor>): boolean {
	const name = getAccessorName(node);
	return (
		name !== null &&
		accessors.some((other) => {
			return (
				name === getAccessorName(other) &&
				node.kind !== other.kind &&
				(node.type === AST_NODE_TYPES.MethodDefinition && node.static) ===
					(other.type === AST_NODE_TYPES.MethodDefinition && other.static) &&
				(node.key.type === AST_NODE_TYPES.PrivateIdentifier) ===
					(other.key.type === AST_NODE_TYPES.PrivateIdentifier)
			);
		})
	);
}

function removeAccessorKeyword(
	sourceCode: TSESLint.SourceCode,
	node: Accessor,
	fixer: TSESLint.RuleFixer,
): null | TSESLint.RuleFix {
	const accessor = sourceCode.getTokenBefore(node.key, {
		filter: (token) => token.value === node.kind,
	});
	if (accessor === null) {
		return null;
	}

	const next = sourceCode.getTokenAfter(accessor, { includeComments: true });
	return next === null ? null : fixer.removeRange([accessor.range[0], next.range[0]]);
}

export const noGetSet = createRobloxRule({
	name: RULE_NAME,
	createOnce,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow getters and setters",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
});
