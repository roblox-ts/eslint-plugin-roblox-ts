import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import type {
	ParserServicesWithTypeInformation,
	TSESLint,
	TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-object-math";

const OBJECT_MATH_VIOLATION = "object-math-violation";
const OTHER_VIOLATION = "other-violation";

const messages = {
	[OBJECT_MATH_VIOLATION]:
		"'{{operator}}' is not supported for Roblox DataType math operations. Use .{{method}}() instead.",
	[OTHER_VIOLATION]: "Cannot use this operator on a Roblox Data type.",
};

// Mapping of datatype to their supported methods based on macro_math.d.ts
const dataTypeMethodSupport = new Map([
	["CFrame", new Set(["add", "mul", "sub"])],
	["UDim2", new Set(["add", "sub"])],
	["UDim", new Set(["add", "sub"])],
	["Vector2", new Set(["add", "div", "mul", "sub"])],
	["Vector2int16", new Set(["add", "div", "mul", "sub"])],
	["Vector3", new Set(["add", "div", "mul", "sub"])],
	["Vector3int16", new Set(["add", "div", "mul", "sub"])],
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
			handleBinaryExpression(node, context, parserServices);
		},
	};
}

function createFixFunction(fixParameters: {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	fixer: TSESLint.RuleFixer;
	macroName: string;
	node: TSESTree.BinaryExpression;
	shouldSwapOperands: boolean;
}): Array<TSESLint.RuleFix> {
	const { context, fixer, macroName, node, shouldSwapOperands } = fixParameters;
	const { left, operator, right } = node;
	const { sourceCode } = context;

	// If swapping operands (e.g., 2 * vector -> vector.mul(2))
	if (shouldSwapOperands) {
		return createSwappedFix({ fixer, left, macroName, right, sourceCode });
	}

	return createNormalFix({ fixer, left, macroName, operator, right, sourceCode });
}

function createMathOperationFix(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	macroName: string,
	node: TSESTree.BinaryExpression,
	shouldSwapOperands = false,
): void {
	const { operator } = node;

	context.report({
		data: {
			method: macroName,
			operator,
		},
		fix: fixer => createFixFunction({ context, fixer, macroName, node, shouldSwapOperands }),
		messageId: OBJECT_MATH_VIOLATION,
		node,
	});
}

function createNormalFix(parameters: {
	fixer: TSESLint.RuleFixer;
	left: TSESTree.Node;
	macroName: string;
	operator: string;
	right: TSESTree.Node;
	sourceCode: TSESLint.SourceCode;
}): Array<TSESLint.RuleFix> {
	const { fixer, left, macroName, operator, right, sourceCode } = parameters;
	const textBetween = sourceCode.text.slice(left.range[1], right.range[0]);
	const { afterOp, beforeOp, hasParentheses } = determineOperatorContext(textBetween, operator);

	if (hasParentheses) {
		return [
			fixer.replaceTextRange(
				[left.range[1] + beforeOp.length, right.range[0] - afterOp.length],
				`.${macroName}(`,
			),
			fixer.insertTextAfter(right, ")"),
		];
	}

	return [
		fixer.replaceTextRange([left.range[1], right.range[0]], `.${macroName}(`),
		fixer.insertTextAfter(right, ")"),
	];
}

function createSwappedFix(parameters: {
	fixer: TSESLint.RuleFixer;
	left: TSESTree.Node;
	macroName: string;
	right: TSESTree.Node;
	sourceCode: TSESLint.SourceCode;
}): Array<TSESLint.RuleFix> {
	const { fixer, left, macroName, right, sourceCode } = parameters;
	return [
		fixer.replaceTextRange(
			[left.range[0], right.range[1]],
			`${sourceCode.getText(right)}.${macroName}(${sourceCode.getText(left)})`,
		),
	];
}

function determineOperatorContext(
	textBetween: string,
	operator: string,
): { afterOp: string; beforeOp: string; hasParentheses: boolean } {
	const hasParentheses = textBetween.includes(")") && textBetween.includes(operator);

	if (!hasParentheses) {
		return { afterOp: "", beforeOp: "", hasParentheses: false };
	}

	const operatorIndex = textBetween.indexOf(operator);
	const beforeOp = textBetween.slice(0, operatorIndex).trimEnd();
	const afterOp = textBetween.slice(operatorIndex + operator.length).trimStart();

	return { afterOp, beforeOp, hasParentheses: true };
}

function getDataTypeName(
	node: TSESTree.Node,
	parserServices: ParserServicesWithTypeInformation,
): string | undefined {
	const type = getConstrainedTypeAtLocation(parserServices, node);
	const symbol = type.getSymbol();
	if (symbol) {
		const symbolName = symbol.getName();
		return dataTypeMethodSupport.has(symbolName) ? symbolName : undefined;
	}

	return undefined;
}

function handleBinaryExpression(
	node: TSESTree.BinaryExpression,
	context: Readonly<TSESLint.RuleContext<string, []>>,
	parserServices: ParserServicesWithTypeInformation,
): void {
	const { left, operator, right } = node;

	const leftDataType = getDataTypeName(left, parserServices);
	const rightDataType = getDataTypeName(right, parserServices);

	if (leftDataType === undefined && rightDataType === undefined) {
		return;
	}

	if (safeOperationSymbols.has(operator)) {
		return;
	}

	handleMathOperation({ context, leftDataType, node, operator, rightDataType });
}

function handleMathOperation(parameters: {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	leftDataType: string | undefined;
	node: TSESTree.BinaryExpression;
	operator: string;
	rightDataType: string | undefined;
}): void {
	const { context, leftDataType, node, operator, rightDataType } = parameters;

	const macroName = mathOperationToMacroName.get(operator);
	if (macroName === undefined) {
		reportUnsupportedOperation(context, node);
		return;
	}

	if (tryLeftOperand(context, macroName, node, leftDataType)) {
		return;
	}

	if (tryRightOperand({ context, leftDataType, macroName, node, rightDataType })) {
		return;
	}

	reportUnsupportedOperation(context, node);
}

function reportUnsupportedOperation(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.BinaryExpression,
): void {
	context.report({
		messageId: OTHER_VIOLATION,
		node,
	});
}

function tryLeftOperand(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	macroName: string,
	node: TSESTree.BinaryExpression,
	leftDataType: string | undefined,
): boolean {
	if (
		leftDataType !== undefined &&
		dataTypeMethodSupport.get(leftDataType)?.has(macroName) === true
	) {
		createMathOperationFix(context, macroName, node, false);
		return true;
	}

	return false;
}

function tryRightOperand(parameters: {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	leftDataType: string | undefined;
	macroName: string;
	node: TSESTree.BinaryExpression;
	rightDataType: string | undefined;
}): boolean {
	const { context, leftDataType, macroName, node, rightDataType } = parameters;
	if (
		rightDataType !== undefined &&
		leftDataType === undefined &&
		dataTypeMethodSupport.get(rightDataType)?.has(macroName) === true
	) {
		createMathOperationFix(context, macroName, node, true);
		return true;
	}

	return false;
}

export const noObjectMath = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Enforce DataType math methods over operators",
			recommended: true,
			requiresTypeChecking: true,
		},
		fixable: "code",
		hasSuggestions: false,
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
