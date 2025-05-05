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

const LUAU_IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const INVALID_CHARACTERS = "invalid-characters";
const INVALID_IDENTIFIER = "invalid-identifier";

const messages = {
	[INVALID_CHARACTERS]:
		"Identifier '{{ identifier }}' contains invalid characters. Only letters, digits, and underscores are allowed.",
	[INVALID_IDENTIFIER]:
		"Avoid using '{{ identifier }}' as an identifier, as it is a reserved keyword in Luau.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		Identifier(node: TSESTree.Identifier) {
			if (!BANNED_KEYWORDS.has(node.name) && LUAU_IDENTIFIER_REGEX.test(node.name)) {
				return;
			}

			const { name, parent } = node;

			if (isAllowedContext(node, parent)) {
				return;
			}

			context.report({
				data: { identifier: name },
				messageId: BANNED_KEYWORDS.has(name) ? INVALID_IDENTIFIER : INVALID_CHARACTERS,
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

type NodeWithKey =
	| TSESTree.MethodDefinition
	| TSESTree.Property
	| TSESTree.PropertyDefinition
	| TSESTree.TSPropertySignature;

function isAllowedContext(node: TSESTree.Identifier, parent: TSESTree.Node): boolean {
	// isPropertyKey
	if (PROPERTY_KEY_PARENT_TYPES.has(parent.type) && (parent as NodeWithKey).key === node) {
		return true;
	}

	// isEnumMemberId
	if (parent.type === AST_NODE_TYPES.TSEnumMember && parent.id === node) {
		return true;
	}

	// isMemberExpressionProperty
	return (
		parent.type === AST_NODE_TYPES.MemberExpression &&
		parent.property === node &&
		!parent.computed
	);
}

export const noInvalidIdentifier = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow the use of Luau reserved keywords as identifiers",
			recommended: true,
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
