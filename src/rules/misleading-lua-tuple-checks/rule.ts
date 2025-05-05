import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import {
	AST_NODE_TYPES,
	type ParserServicesWithTypeInformation,
	type TSESLint,
	type TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";
import type { TestExpression } from "../../utils/types";

export const RULE_NAME = "misleading-lua-tuple-checks";

const BANNED_LUA_TUPLE_CHECK = "misleading-lua-tuple-check";

const messages = {
	[BANNED_LUA_TUPLE_CHECK]: "Unexpected LuaTuple in conditional expression. Add [0].",
};

function checkLuaTupleUsage(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.Node,
): void {
	const { aliasSymbol } = getConstrainedTypeAtLocation(parserServices, node);
	if (aliasSymbol && aliasSymbol.escapedName.toString() === "LuaTuple") {
		context.report({
			fix: fix => fix.insertTextAfter(node, "[0]"),
			messageId: BANNED_LUA_TUPLE_CHECK,
			node,
		});
	}
}

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	function containsBoolean() {
		return ({ test }: TestExpression): void => {
			if (test && test.type !== AST_NODE_TYPES.LogicalExpression) {
				checkLuaTupleUsage(context, parserServices, test);
			}
		};
	}

	return {
		"ConditionalExpression": containsBoolean(),
		"DoWhileStatement": containsBoolean(),
		"ForStatement": containsBoolean(),
		"IfStatement": containsBoolean(),
		"LogicalExpression": ({ left, right }) => {
			checkLuaTupleUsage(context, parserServices, left);
			checkLuaTupleUsage(context, parserServices, right);
		},
		'UnaryExpression[operator="!"]': ({ argument }: TSESTree.UnaryExpression) => {
			checkLuaTupleUsage(context, parserServices, argument);
		},
		"WhileStatement": containsBoolean(),
	};
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
