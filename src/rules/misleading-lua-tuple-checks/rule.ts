import {
	AST_NODE_TYPES,
	type ParserServicesWithTypeInformation,
	type TSESLint,
	type TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type { ReportFixFunction } from "@typescript-eslint/utils/ts-eslint";

import { isArrayBindingOrAssignmentPattern, isTypeReference } from "ts-api-utils";
import type { Type } from "typescript";

import { createEslintRule } from "../../util";
import { getConstrainedType, isIterableFunctionType, type TestExpression } from "../../utils/types";

export const RULE_NAME = "misleading-lua-tuple-checks";

const BANNED_LUA_TUPLE_CHECK = "misleading-lua-tuple-check";
const LUA_TUPLE_DECLARATION = "lua-tuple-declaration";

const messages = {
	[BANNED_LUA_TUPLE_CHECK]: "Unexpected LuaTuple in conditional expression. Add [0].",
	[LUA_TUPLE_DECLARATION]: "Unexpected LuaTuple in declaration, use array destructuring.",
};

type Context = Readonly<TSESLint.RuleContext<string, []>>;

const LUA_TUPLE_CANDIDATES: ReadonlySet<AST_NODE_TYPES> = new Set([
	AST_NODE_TYPES.AssignmentExpression,
	AST_NODE_TYPES.AwaitExpression,
	AST_NODE_TYPES.CallExpression,
	AST_NODE_TYPES.ChainExpression,
	AST_NODE_TYPES.ConditionalExpression,
	AST_NODE_TYPES.LogicalExpression,
	AST_NODE_TYPES.MemberExpression,
	AST_NODE_TYPES.SequenceExpression,
	AST_NODE_TYPES.TaggedTemplateExpression,
	AST_NODE_TYPES.TSAsExpression,
	AST_NODE_TYPES.TSNonNullExpression,
	AST_NODE_TYPES.TSSatisfiesExpression,
	AST_NODE_TYPES.TSTypeAssertion,
	AST_NODE_TYPES.YieldExpression,
]);

/**
 * Syntactic pre-filter: only these expression kinds can ever have a `LuaTuple`
 * type, so everything else (literals, comparisons, arithmetic, functions,
 * object/array literals, ...) skips the type checker entirely. Identifiers are
 * handled separately so the ubiquitous `undefined` stays free as well.
 *
 * @param node - The expression node to test.
 * @returns Whether the node could possibly be typed as `LuaTuple`.
 */
function canBeLuaTuple(node: TSESTree.Node): boolean {
	if (node.type === AST_NODE_TYPES.Identifier) {
		return node.name !== "undefined";
	}

	return LUA_TUPLE_CANDIDATES.has(node.type);
}

function checkLuaTupleUsage(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.Node,
): void {
	if (isLuaTuple(parserServices, node)) {
		reportLuaTupleUsage(context, node);
	}
}

// eslint-disable-next-line max-lines-per-function -- listener registry, grows with each context
function create(context: Context): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	return {
		'AssignmentExpression[operator="="][left.type="Identifier"]': (
			node: TSESTree.AssignmentExpression,
		) => {
			validateAssignmentExpression(context, parserServices, node);
		},
		"BinaryExpression[operator=/^[!=]==?$/]": ({ left, right }: TSESTree.BinaryExpression) => {
			// Equality only: tsc rejects relational comparisons on LuaTuple
			checkLuaTupleUsage(context, parserServices, left);
			checkLuaTupleUsage(context, parserServices, right);
		},
		"ConditionalExpression, DoWhileStatement, IfStatement, ForStatement, WhileStatement": (
			node: TestExpression,
		) => {
			validateTestExpression(context, parserServices, node);
		},
		"ForOfStatement": (node: TSESTree.ForOfStatement) => {
			validateForOfStatement(context, parserServices, node);
		},
		"LogicalExpression": ({ left, right }) => {
			checkLuaTupleUsage(context, parserServices, left);
			checkLuaTupleUsage(context, parserServices, right);
		},
		'UnaryExpression[operator="!"]': ({ argument }: TSESTree.UnaryExpression) => {
			checkLuaTupleUsage(context, parserServices, argument);
		},
		'VariableDeclarator[id.type="Identifier"]': (node: TSESTree.VariableDeclarator) => {
			validateVariableDeclarator(context, parserServices, node);
		},
	};
}

function ensureArrayDestructuring(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	leftNode: TSESTree.Identifier,
): void {
	const esNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
	if (isArrayBindingOrAssignmentPattern(esNode)) {
		return;
	}

	const fixer = fixIntoArrayDestructuring(context, leftNode);

	context.report({
		fix: fixer,
		messageId: LUA_TUPLE_DECLARATION,
		node: leftNode,
	});
}

function fixIntoArrayDestructuring(
	context: Context,
	node: TSESTree.Identifier,
): null | ReportFixFunction {
	const { sourceCode } = context;

	return (fixer: TSESLint.RuleFixer) => {
		let replacement = `[${node.name}]`;

		if (node.typeAnnotation) {
			replacement += sourceCode.getText(node.typeAnnotation);
		}

		return fixer.replaceText(node, replacement);
	};
}

function handleIterableFunction(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.ForOfStatement,
	type: Type,
): void {
	if (!isTypeReference(type)) {
		return;
	}

	const checker = parserServices.program.getTypeChecker();
	const typeArgument = checker.getTypeArguments(type)[0];
	if (!typeArgument || !isLuaTupleAlias(typeArgument)) {
		return;
	}

	if (node.left.type === AST_NODE_TYPES.Identifier) {
		ensureArrayDestructuring(context, parserServices, node.left);
		return;
	}

	if (node.left.type !== AST_NODE_TYPES.VariableDeclaration) {
		return;
	}

	const variableDeclarator = node.left.declarations[0];
	if (variableDeclarator.id.type === AST_NODE_TYPES.Identifier) {
		ensureArrayDestructuring(context, parserServices, variableDeclarator.id);
	}
}

function isLuaTuple(
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.Node,
	precomputedType?: Type,
): boolean {
	return (
		canBeLuaTuple(node) &&
		isLuaTupleAlias(precomputedType ?? getConstrainedType(parserServices, node))
	);
}

function isLuaTupleAlias(type: Type): boolean {
	const { aliasSymbol } = type;
	return aliasSymbol !== undefined && (aliasSymbol.escapedName as string) === "LuaTuple";
}

/** Node kinds that bind looser than member access and need parens before [0]. */
const NEEDS_PARENS: ReadonlySet<AST_NODE_TYPES> = new Set([
	AST_NODE_TYPES.AssignmentExpression,
	AST_NODE_TYPES.AwaitExpression,
	AST_NODE_TYPES.ConditionalExpression,
	AST_NODE_TYPES.LogicalExpression,
	AST_NODE_TYPES.SequenceExpression,
	AST_NODE_TYPES.TSAsExpression,
	AST_NODE_TYPES.TSSatisfiesExpression,
	AST_NODE_TYPES.TSTypeAssertion,
	AST_NODE_TYPES.YieldExpression,
]);

function reportLuaTupleUsage(context: Context, node: TSESTree.Node): void {
	context.report({
		fix: (fixer) => {
			if (NEEDS_PARENS.has(node.type)) {
				return fixer.replaceText(node, `(${context.sourceCode.getText(node)})[0]`);
			}

			return fixer.insertTextAfter(node, "[0]");
		},
		messageId: BANNED_LUA_TUPLE_CHECK,
		node,
	});
}

function validateAssignmentExpression(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.AssignmentExpression,
): void {
	// Check the right side first: it is usually a literal or other cheap
	// non-candidate, which lets us skip the type query on the left entirely.
	if (isLuaTuple(parserServices, node.right) && !isLuaTuple(parserServices, node.left)) {
		ensureArrayDestructuring(context, parserServices, node.left as TSESTree.Identifier);
	}
}

function validateForOfStatement(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.ForOfStatement,
): void {
	const rightNode = node.right;
	const type = getConstrainedType(parserServices, rightNode);

	if (isIterableFunctionType(parserServices.program, type)) {
		handleIterableFunction(context, parserServices, node, type);
	} else if (isLuaTuple(parserServices, rightNode, type)) {
		reportLuaTupleUsage(context, rightNode);
	}
}

function validateTestExpression(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	{ test }: TestExpression,
): void {
	if (test && test.type !== AST_NODE_TYPES.LogicalExpression) {
		checkLuaTupleUsage(context, parserServices, test);
	}
}

function validateVariableDeclarator(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.VariableDeclarator,
): void {
	if (node.init && isLuaTuple(parserServices, node.init)) {
		ensureArrayDestructuring(context, parserServices, node.id as TSESTree.Identifier);
	}
}

export const misleadingLuaTupleChecks = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow the use of LuaTuple in conditional expressions",
			recommended: true,
			requiresTypeChecking: true,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
});
