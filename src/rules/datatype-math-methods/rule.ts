import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import type { TSESLint } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "datatype-math-methods";

const MESSAGE_ID = "math-method";

const messages = {
	[MESSAGE_ID]:
		"'{{operator}}' is not supported for Roblox DataType math operations. Use .{{method}}() instead.",
};

const dataTypes = new Set([
	"CFrame",
	"UDim",
	"UDim2",
	"Vector2",
	"Vector2int16",
	"Vector3",
	"Vector3int16",
]);

const mathOperationToMacroName = new Map([
	["*", "mul"],
	["+", "add"],
	["-", "sub"],
	["/", "div"],
]);

/**
 * Rule definition.
 *
 * @param context - ESLint rule context.
 * @returns Rule listener object.
 */
function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	return {
		BinaryExpression: node => {
			const { left, operator, right } = node;

			const macroName = mathOperationToMacroName.get(operator);
			if (macroName === undefined) {
				return;
			}

			const type = getConstrainedTypeAtLocation(parserServices, left);
			const symbol = type.getSymbol();

			if (!symbol || !dataTypes.has(symbol.getName())) {
				return;
			}

			context.report({
				data: { method: macroName, operator },
				fix: fixer => {
					return [
						fixer.replaceTextRange([left.range[1], right.range[0]], `.${macroName}(`),
						fixer.insertTextAfter(right, ")"),
					];
				},
				messageId: MESSAGE_ID,
				node,
			});
		},
	};
}

export const datatypeMathMethods = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description:
				"Enforce using DataType math methods (.add(), .sub(), .mul(), .div()) instead of operators",
			recommended: true,
			requiresTypeChecking: true,
		},
		fixable: "code",
		hasSuggestions: false,
		messages,
		schema: [],
		type: "suggestion",
	},
	name: RULE_NAME,
});
