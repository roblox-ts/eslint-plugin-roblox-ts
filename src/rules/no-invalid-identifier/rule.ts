import LuauAst from "@roblox-ts/luau-ast";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-invalid-identifier";

const LUAU_IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const LUAU_KEYWORDS = new Set([
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

const RESERVED_KEYWORDS = new Set(Object.keys(LuauAst.globals));

const INVALID_CHARACTERS = "invalid-characters";
const INVALID_IDENTIFIER = "invalid-identifier";
const RESERVED_IDENTIFIER = "reserved-identifier";

const messages = {
	[INVALID_CHARACTERS]:
		"Identifier '{{ identifier }}' contains invalid characters. Only letters, digits, and underscores are allowed.",
	[INVALID_IDENTIFIER]:
		"Avoid using '{{ identifier }}' as an identifier, as it is a reserved keyword in Luau.",
	[RESERVED_IDENTIFIER]:
		"Avoid using '{{ identifier }}' as an identifier, as it is a reserved for usage by the roblox-ts compiler.",
};

type ExpressionDeclarationNodes =
	| TSESTree.ArrowFunctionExpression
	| TSESTree.CatchClause
	| TSESTree.ClassDeclaration
	| TSESTree.ClassExpression
	| TSESTree.FunctionDeclaration
	| TSESTree.FunctionExpression
	| TSESTree.TSEnumDeclaration
	| TSESTree.TSModuleDeclaration
	| TSESTree.VariableDeclaration;

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const { sourceCode } = context;

	return {
		[[
			"VariableDeclaration",
			"FunctionDeclaration",
			"FunctionExpression",
			"ArrowFunctionExpression",
			"CatchClause",
			"TSEnumDeclaration",
			"TSModuleDeclaration",
		].join(",")](node: ExpressionDeclarationNodes) {
			for (const variable of sourceCode.getDeclaredVariables(node)) {
				validateIdentifier(context, node, variable.name);
			}
		},
		"ClassDeclaration, ClassExpression": function (
			node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
		) {
			if (node.id?.name !== undefined) {
				validateIdentifier(context, node, node.id.name);
			}
		},
		"ImportDeclaration": function (node: TSESTree.ImportDeclaration) {
			for (const variable of sourceCode.getDeclaredVariables(node)) {
				validateIdentifier(context, node, variable.name, () => isImportAlias(node));
			}
		},
	};
}

function getMessageId(name: string): string {
	if (LUAU_KEYWORDS.has(name)) {
		return INVALID_IDENTIFIER;
	}

	if (RESERVED_KEYWORDS.has(name)) {
		return RESERVED_IDENTIFIER;
	}

	return INVALID_CHARACTERS;
}

function isImportAlias(node: TSESTree.ImportDeclaration): boolean {
	for (const specifier of node.specifiers) {
		if (
			specifier.type === AST_NODE_TYPES.ImportSpecifier &&
			(specifier.imported.type !== AST_NODE_TYPES.Identifier ||
				specifier.local.name !== specifier.imported.name)
		) {
			return true;
		}
	}

	return false;
}

function isRestricted(name: string): boolean {
	return (
		LUAU_KEYWORDS.has(name) || RESERVED_KEYWORDS.has(name) || !LUAU_IDENTIFIER_REGEX.test(name)
	);
}

function validateIdentifier(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.Node,
	name: string,
	validate?: () => boolean,
): void {
	if (!isRestricted(name) || validate?.() === false) {
		return;
	}

	context.report({
		data: { identifier: name },
		messageId: getMessageId(name),
		node,
	});
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
