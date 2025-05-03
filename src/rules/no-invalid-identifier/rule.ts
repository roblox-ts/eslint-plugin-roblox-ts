import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-invalid-identifier";

const BANNED_KEYWORDS = new Set([
	"and",
	"elseif",
	"end",
	"error",
	"local",
	"nil",
	"not",
	"or",
	"repeat",
	"then",
	"until",
]);

const INVALID_IDENTIFIER = "invalid-identifier";

const messages = {
	[INVALID_IDENTIFIER]:
		"Avoid using '{{ identifier }}' as an identifier, as it is a reserved keyword in Luau.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		Identifier(node: TSESTree.Identifier) {
			if (!BANNED_KEYWORDS.has(node.name)) {
				return;
			}

			const { name, parent } = node;

			if (isAllowedContext(node, parent)) {
				return;
			}

			context.report({
				data: {
					identifier: name,
				},
				messageId: INVALID_IDENTIFIER,
				node,
			});
		},
	};
}

const PROPERTY_KEY_PARENT_TYPES = new Set([
	AST_NODE_TYPES.MethodDefinition,
	AST_NODE_TYPES.Property,
	AST_NODE_TYPES.PropertyDefinition,
	AST_NODE_TYPES.TSPropertySignature,
]);

function isAllowedContext(node: TSESTree.Identifier, parent: TSESTree.Node): boolean {
	const isPropertyKey =
		PROPERTY_KEY_PARENT_TYPES.has(parent.type) && "key" in parent && parent.key === node;

	const isEnumMemberId = parent.type === AST_NODE_TYPES.TSEnumMember && parent.id === node;

	const isMemberExpressionProperty =
		parent.type === AST_NODE_TYPES.MemberExpression &&
		parent.property === node &&
		!parent.computed;

	return isPropertyKey || isEnumMemberId || isMemberExpressionProperty;
}

export const noInvalidIdentifier = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallows the use of Luau reserved keywords as identifiers.",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
