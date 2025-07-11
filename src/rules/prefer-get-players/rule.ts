import { getConstrainedTypeAtLocation, isBuiltinSymbolLike } from "@typescript-eslint/type-utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "prefer-get-players";

const MESSAGE_ID = "get-players-children-violation";

const messages = {
	[MESSAGE_ID]:
		"Use Players.GetPlayers() instead of Players.GetChildren() for more accurate types.",
};

type Context = Readonly<TSESLint.RuleContext<MessageIds, RuleOptions>>;
type MessageIds = typeof MESSAGE_ID;
type RuleOptions = [{ validateType: boolean }];

function check(
	context: Context,
	node: TSESTree.CallExpression,
	callee: TSESTree.MemberExpression,
): void {
	context.report({
		fix: (fixer) => fixer.replaceText(callee.property, "GetPlayers"),
		messageId: MESSAGE_ID,
		node,
	});
}

function create(
	context: Context,
	[{ validateType }]: Readonly<RuleOptions>,
): TSESLint.RuleListener {
	return {
		CallExpression(node: TSESTree.CallExpression) {
			const { callee } = node;
			if (
				callee.type !== AST_NODE_TYPES.MemberExpression ||
				callee.property.type !== AST_NODE_TYPES.Identifier ||
				callee.property.name !== "GetChildren"
			) {
				return;
			}

			if (validateType) {
				isPlayersCallExpressionType(context, node, callee);
			} else {
				isPlayersCallExpression(context, node, callee);
			}
		},
	};
}

function isPlayersCallExpression(
	context: Context,
	node: TSESTree.CallExpression,
	callee: TSESTree.MemberExpression,
): void {
	if (callee.object.type !== AST_NODE_TYPES.Identifier || callee.object.name !== "Players") {
		return;
	}

	check(context, node, callee);
}

function isPlayersCallExpressionType(
	context: Context,
	node: TSESTree.CallExpression,
	callee: TSESTree.MemberExpression,
): void {
	const parserServices = getParserServices(context);
	const type = getConstrainedTypeAtLocation(parserServices, callee.object);

	const isPlayersType = isBuiltinSymbolLike(parserServices.program, type, ["Players"]);
	if (!isPlayersType) {
		return;
	}

	const hasGetPlayersProperty = type.getProperty("GetPlayers");
	if (!hasGetPlayersProperty) {
		return;
	}

	check(context, node, callee);
}

export const preferGetPlayers = createEslintRule({
	create,
	defaultOptions: [
		{
			validateType: false,
		},
	],
	meta: {
		defaultOptions: [
			{
				validateType: false,
			},
		],
		docs: {
			description:
				"Enforces the use of Players.GetPlayers() instead of Players.GetChildren()",
			recommended: false,
			requiresTypeChecking: false,
		},
		fixable: "code",
		hasSuggestions: false,
		messages,
		schema: [
			{
				properties: {
					validateType: {
						default: false,
						description:
							"Enable or disable type validation. Useful if your Players variable has an alias.",
						type: "boolean",
					},
				},
				type: "object",
			},
		],
		type: "problem",
	},
	name: RULE_NAME,
});
