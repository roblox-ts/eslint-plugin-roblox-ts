import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import {
	AST_NODE_TYPES,
	type ParserServicesWithTypeInformation,
	type TSESLint,
	type TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type { ReportFixFunction } from "@typescript-eslint/utils/ts-eslint";

import { isArrayBindingOrAssignmentPattern } from "ts-api-utils";

import { createEslintRule } from "../../util";
import type { TestExpression } from "../../utils/types";

export const RULE_NAME = "misleading-lua-tuple-checks";

const BANNED_LUA_TUPLE_CHECK = "misleading-lua-tuple-check";
const LUA_TUPLE_DECLARATION = "lua-tuple-declaration";

const messages = {
	[BANNED_LUA_TUPLE_CHECK]: "Unexpected LuaTuple in conditional expression. Add [0].",
	[LUA_TUPLE_DECLARATION]: "Unexpected LuaTuple in declaration, use array destructuring.",
};

type Context = Readonly<TSESLint.RuleContext<string, []>>;

function checkLuaTupleUsage(
	context: Context,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.Node,
): void {
	if (isLuaTuple(parserServices, node)) {
		context.report({
			fix: fixer => fixer.insertTextAfter(node, "[0]"),
			messageId: BANNED_LUA_TUPLE_CHECK,
			node,
		});
	}
}

function create(context: Context): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	function containsBoolean({ test }: TestExpression): void {
		if (test && test.type !== AST_NODE_TYPES.LogicalExpression) {
			checkLuaTupleUsage(context, parserServices, test);
		}
	}

	return {
		"ConditionalExpression": containsBoolean,
		"DoWhileStatement": containsBoolean,
		"ForStatement": containsBoolean,
		"IfStatement": containsBoolean,
		"LogicalExpression": ({ left, right }) => {
			checkLuaTupleUsage(context, parserServices, left);
			checkLuaTupleUsage(context, parserServices, right);
		},
		'UnaryExpression[operator="!"]': ({ argument }: TSESTree.UnaryExpression) => {
			checkLuaTupleUsage(context, parserServices, argument);
		},
		"VariableDeclarator": (node: TSESTree.VariableDeclarator) => {
			performCheck(context, node);
		},
		"WhileStatement": containsBoolean,
	};
}

function fixIntoArrayDestructuring(
	context: Context,
	node: TSESTree.VariableDeclarator,
): null | ReportFixFunction {
	const { sourceCode } = context;
	const { id: leftNode } = node;

	if (leftNode.type !== AST_NODE_TYPES.Identifier) {
		return null;
	}

	return (fixer: TSESLint.RuleFixer) => {
		let replacement = `[${leftNode.name}]`;

		if (leftNode.typeAnnotation) {
			replacement += sourceCode.getText(leftNode.typeAnnotation);
		}

		return fixer.replaceText(leftNode, replacement);
	};
}

function isLuaTuple(
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.Node,
): boolean {
	const { aliasSymbol } = getConstrainedTypeAtLocation(parserServices, node);
	return (aliasSymbol && aliasSymbol.escapedName.toString() === "LuaTuple") ?? false;
}

function performCheck(context: Context, node: TSESTree.VariableDeclarator): void {
	const { id: leftNode } = node;

	const parserServices = getParserServices(context);
	if (!isLuaTuple(parserServices, leftNode)) {
		return;
	}

	const esNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
	if (isArrayBindingOrAssignmentPattern(esNode)) {
		return;
	}

	const fixer = fixIntoArrayDestructuring(context, node);

	context.report({
		fix: fixer,
		messageId: LUA_TUPLE_DECLARATION,
		node: leftNode,
	});
}

export const misleadingLuaTupleChecks = createEslintRule({
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
	name: RULE_NAME,
});
