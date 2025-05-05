import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-object-math";

const OBJECT_MATH_VIOLATION = "object-math-violation";
const OTHER_VIOLATION = "other-violation";

const messages = {
	[OBJECT_MATH_VIOLATION]: "Do not use `{{operator}} use {{function}}() instead.",
	[OTHER_VIOLATION]: "Cannot use this operator on a Roblox Data type.",
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

const safeOperationSymbols = new Set<string>(["!==", "==="]);

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	return {
		BinaryExpression: node => {
			const { left, operator } = node;

			const type = getConstrainedTypeAtLocation(parserServices, left);
			const symbol = type.getSymbol();

			if (!symbol || !dataTypes.has(symbol.getName())) {
				return;
			}

			const macroName = mathOperationToMacroName.get(operator);
			if (macroName !== undefined) {
				createMathOperationFix(context, macroName, node);
				return;
			}

			if (!safeOperationSymbols.has(operator)) {
				context.report({
					messageId: OTHER_VIOLATION,
					node,
				});
			}
		},
	};
}

function createMathOperationFix(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	macroName: string,
	node: TSESTree.BinaryExpression,
): void {
	const { left, operator, right } = node;

	context.report({
		data: {
			function: macroName,
			operator,
		},
		fix: fix => {
			return [
				fix.replaceTextRange([left.range[1], right.range[0]], `.${macroName}(`),
				fix.insertTextAfter(right, ")"),
			];
		},
		messageId: OBJECT_MATH_VIOLATION,
		node,
	});
}

export const noObjectMath = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow using objects in mathematical operations",
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
