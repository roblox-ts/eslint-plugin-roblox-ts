import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import {
	type ParserServicesWithTypeInformation,
	type TSESLint,
	TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";
import {
	isEmptyStringType,
	isNumberLiteralType,
	isPossiblyType,
	type TestExpression,
} from "../../utils/types";

export const RULE_NAME = "lua-truthiness";

const FALSY_STRING_NUMBER_CHECK = "falsy-string-number-check";

const messages = {
	[FALSY_STRING_NUMBER_CHECK]:
		'0, NaN, and "" are falsy in TS. If intentional, disable this rule by placing `"roblox-ts-x/lua-truthiness": "off"` in your eslint.config file in the "rules" object.',
};

function checkTruthy(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	parserServices: ParserServicesWithTypeInformation,
	node: TSESTree.Node,
): void {
	const type = getConstrainedTypeAtLocation(parserServices, node);

	const isAssignableToZero = isPossiblyType(type, inner => isNumberLiteralType(inner, 0));
	const isAssignableToEmptyString = isPossiblyType(type, inner => isEmptyStringType(inner));

	if (isAssignableToZero || isAssignableToEmptyString) {
		context.report({
			fix: undefined,
			messageId: FALSY_STRING_NUMBER_CHECK,
			node,
		});
	}
}

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	function containsBoolean() {
		return ({ test }: TestExpression): void => {
			if (test && test.type !== TSESTree.AST_NODE_TYPES.LogicalExpression) {
				checkTruthy(context, parserServices, test);
			}
		};
	}

	return {
		"ConditionalExpression": containsBoolean(),
		"DoWhileStatement": containsBoolean(),
		"ForStatement": containsBoolean(),
		"IfStatement": containsBoolean(),
		"LogicalExpression": ({ left, operator, parent, right }) => {
			if (operator !== "??") {
				checkTruthy(context, parserServices, left);
				return;
			}

			if (parent.type === TSESTree.AST_NODE_TYPES.IfStatement) {
				checkTruthy(context, parserServices, right);
			}
		},
		'UnaryExpression[operator="!"]': ({ argument }: TSESTree.UnaryExpression) => {
			checkTruthy(context, parserServices, argument);
		},
		"WhileStatement": containsBoolean(),
	};
}

export const luaTruthiness = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Enforces the use of lua truthiness in roblox-ts",
			recommended: true,
			requiresTypeChecking: true,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
