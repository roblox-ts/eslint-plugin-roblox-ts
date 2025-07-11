/* eslint-disable max-lines -- Complex rule with many type definitions and constraint mappings */
import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import {
	AST_NODE_TYPES,
	type ParserServicesWithTypeInformation,
	type TSESLint,
	type TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";
import { getRobloxDataTypeNameRecursive } from "../../utils/types";

export const RULE_NAME = "no-object-math";

const OBJECT_MATH_VIOLATION = "object-math-violation";
const OTHER_VIOLATION = "other-violation";

const messages = {
	[OBJECT_MATH_VIOLATION]:
		"'{{operator}}' is not supported for Roblox DataType math operations. Use .{{method}}() instead.",
	[OTHER_VIOLATION]: "Cannot use {{operator}} on this Roblox Datatype.",
};

interface ConstraintCheckParameters {
	constraints: OperationConstraint;
	otherNode: TSESTree.Node;
	otherType: string | undefined;
	thisType: string;
}

interface FixContext {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	fixer: TSESLint.RuleFixer;
	macroName: string;
	node: TSESTree.BinaryExpression | TSESTree.UnaryExpression;
	shouldSwap?: boolean;
}

interface MathOperationParameters {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	leftDataType: string | undefined;
	node: TSESTree.BinaryExpression;
	operands: { left: TSESTree.Node; operator: string; right: TSESTree.Node };
	rightDataType: string | undefined;
}

interface MethodCallFixParameters {
	fixer: TSESLint.RuleFixer;
	left: TSESTree.Node;
	macroName: string;
	operator: string;
	right: TSESTree.Node;
	sourceCode: TSESLint.SourceCode;
}

// Type definitions
interface OperationConstraint {
	/** What types this operation accepts. */
	acceptedTypes: "number" | "same" | ReadonlyArray<string>;
	/** Whether the operation can be swapped (e.g., 2 * vector -> vector.mul(2)). */
	allowSwapped?: boolean;
}

interface SwappedFixParameters {
	fixer: TSESLint.RuleFixer;
	left: TSESTree.Node;
	macroName: string;
	right: TSESTree.Node;
	sourceCode: TSESLint.SourceCode;
}

interface ValidationContext {
	leftNode: TSESTree.Node;
	leftType: string | undefined;
	operator: string;
	rightNode: TSESTree.Node;
	rightType: string | undefined;
}

interface ValidationParameters {
	macroName: string;
	operandType: string;
	otherNode: TSESTree.Node;
	otherType: string | undefined;
}

interface ValidationResult {
	dataType: string | undefined;
	isValid: boolean;
	shouldSwap: boolean;
}

interface ViolationContext {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	macroName?: string;
	node: TSESTree.BinaryExpression | TSESTree.UnaryExpression;
	operator: string;
	shouldSwap?: boolean;
	type: "math-operation" | "unary-operation" | "unsupported";
}

// Complete constraint map based on macro_math.d.ts
const operationConstraints = new Map<string, Map<string, OperationConstraint>>([
	[
		"CFrame",
		new Map([
			["add", { acceptedTypes: ["Vector3"], allowSwapped: false }],
			["mul", { acceptedTypes: ["CFrame", "Vector3"], allowSwapped: false }],
			["sub", { acceptedTypes: ["Vector3"], allowSwapped: false }],
		]),
	],
	[
		"UDim2",
		new Map([
			["add", { acceptedTypes: "same", allowSwapped: false }],
			["sub", { acceptedTypes: "same", allowSwapped: false }],
		]),
	],
	[
		"UDim",
		new Map([
			["add", { acceptedTypes: "same", allowSwapped: false }],
			["sub", { acceptedTypes: "same", allowSwapped: false }],
		]),
	],
	[
		"Vector2",
		new Map([
			["add", { acceptedTypes: "same", allowSwapped: false }],
			["div", { acceptedTypes: ["Vector2", "number"], allowSwapped: false }],
			["mul", { acceptedTypes: ["Vector2", "number"], allowSwapped: true }],
			["sub", { acceptedTypes: "same", allowSwapped: false }],
		]),
	],
	[
		"Vector2int16",
		new Map([
			["add", { acceptedTypes: "same", allowSwapped: false }],
			["div", { acceptedTypes: "same", allowSwapped: false }],
			["mul", { acceptedTypes: "same", allowSwapped: false }],
			["sub", { acceptedTypes: "same", allowSwapped: false }],
		]),
	],
	[
		"Vector3",
		new Map([
			["add", { acceptedTypes: "same", allowSwapped: false }],
			["div", { acceptedTypes: ["Vector3", "number"], allowSwapped: false }],
			["mul", { acceptedTypes: ["Vector3", "number"], allowSwapped: true }],
			["sub", { acceptedTypes: "same", allowSwapped: false }],
		]),
	],
	[
		"Vector3int16",
		new Map([
			["add", { acceptedTypes: "same", allowSwapped: false }],
			["div", { acceptedTypes: "same", allowSwapped: false }],
			["mul", { acceptedTypes: "same", allowSwapped: false }],
			["sub", { acceptedTypes: "same", allowSwapped: false }],
		]),
	],
]);

// Unary operations support
const unaryOperationSupport = new Map<string, boolean>([
	["CFrame", false],
	["UDim2", true],
	["UDim", true],
	["Vector2", true],
	["Vector2int16", true],
	["Vector3", true],
	["Vector3int16", true],
]);

const mathOperationToMacroName = new Map<string, string>([
	["*", "mul"],
	["+", "add"],
	["-", "sub"],
	["/", "div"],
]);

const safeOperationSymbols = new Set<string>(["!==", "==="]);

interface CreateViolationContextParameters {
	context: Readonly<TSESLint.RuleContext<string, []>>;
	macroName: string;
	node: TSESTree.BinaryExpression;
	operator: string;
	validation: ValidationResult;
}

function buildMethodCallFix({
	fixer,
	left,
	macroName,
	operator,
	right,
	sourceCode,
}: MethodCallFixParameters): Array<TSESLint.RuleFix> {
	const textBetween = sourceCode.text.slice(left.range[1], right.range[0]);
	const { afterOp, beforeOp, hasParentheses } = extractOperatorContext(textBetween, operator);

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

function buildSwappedFix({
	fixer,
	left,
	macroName,
	right,
	sourceCode,
}: SwappedFixParameters): Array<TSESLint.RuleFix> {
	return [
		fixer.replaceTextRange(
			[left.range[0], right.range[1]],
			`${sourceCode.getText(right)}.${macroName}(${sourceCode.getText(left)})`,
		),
	];
}

function buildUnaryFix(
	fixer: TSESLint.RuleFixer,
	sourceCode: TSESLint.SourceCode,
	node: TSESTree.UnaryExpression,
): Array<TSESLint.RuleFix> {
	const argumentText = sourceCode.getText(node.argument);
	return [fixer.replaceText(node, `${argumentText}.mul(-1)`)];
}

function checkConstraints(parameters: ConstraintCheckParameters): boolean {
	const { constraints, otherNode, otherType, thisType } = parameters;
	return (
		isSameTypeConstraint(constraints, otherType, thisType) ||
		isNumberConstraint(constraints, otherType, otherNode) ||
		isTypeInList(constraints, otherType, otherNode)
	);
}

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);

	return {
		"BinaryExpression": (node) => {
			handleBinaryExpression(node, context, parserServices);
		},
		'UnaryExpression[operator="-"]': (node) => {
			handleUnaryExpression(node, context, parserServices);
		},
	};
}

function createOperatorFix(fixContext: FixContext): Array<TSESLint.RuleFix> {
	const { context, fixer, macroName, node, shouldSwap = false } = fixContext;
	const { sourceCode } = context;

	// Handle unary expressions
	if (node.type === AST_NODE_TYPES.UnaryExpression) {
		return buildUnaryFix(fixer, sourceCode, node);
	}

	// Handle binary expressions
	const { left, operator, right } = node;

	if (shouldSwap) {
		return buildSwappedFix({ fixer, left, macroName, right, sourceCode });
	}

	return buildMethodCallFix({ fixer, left, macroName, operator, right, sourceCode });
}

function createValidationResult(
	dataType: string | undefined,
	isValid: boolean,
	shouldSwap = false,
): ValidationResult {
	return { dataType, isValid, shouldSwap };
}

function createViolationContext({
	context,
	macroName,
	node,
	operator,
	validation,
}: CreateViolationContextParameters): ViolationContext {
	const violationType = validation.isValid ? "math-operation" : "unsupported";
	const violationContext: ViolationContext = {
		context,
		node,
		operator,
		type: violationType,
	};

	if (validation.isValid) {
		violationContext.macroName = macroName;
		violationContext.operator = operator;
		violationContext.shouldSwap = validation.shouldSwap;
	}

	return violationContext;
}
// ** End of combined section **

function extractOperatorContext(
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

function getOperationConstraints(
	operandType: string,
	macroName: string,
): OperationConstraint | undefined {
	return operationConstraints.get(operandType)?.get(macroName);
}

function getRobloxTypeFromBinaryExpr(
	node: TSESTree.BinaryExpression,
	parserServices: ParserServicesWithTypeInformation,
): string | undefined {
	const { left, operator, right } = node;
	const macroName = mathOperationToMacroName.get(operator);

	if (macroName === undefined) {
		return undefined;
	}

	// Get types more efficiently by avoiding redundant calls
	const leftType = getRobloxTypeName(left, parserServices);
	const rightType = getRobloxTypeName(right, parserServices);

	const validation = validateOperation({
		leftNode: left,
		leftType,
		operator,
		rightNode: right,
		rightType,
	});

	return validation.isValid ? validation.dataType : undefined;
}

function getRobloxTypeFromMethodCall(
	node: TSESTree.CallExpression,
	parserServices: ParserServicesWithTypeInformation,
): string | undefined {
	if (
		node.callee.type !== AST_NODE_TYPES.MemberExpression ||
		node.callee.property.type !== AST_NODE_TYPES.Identifier
	) {
		return undefined;
	}

	const methodName = node.callee.property.name;
	const objectType = getSimpleRobloxType(node.callee.object, parserServices);

	if (
		objectType !== undefined &&
		operationConstraints.get(objectType)?.has(methodName) === true
	) {
		return objectType;
	}

	return undefined;
}

function getRobloxTypeName(
	node: TSESTree.Node,
	parserServices: ParserServicesWithTypeInformation,
): string | undefined {
	// Handle simple types first (most common case)
	const simpleType = getSimpleRobloxType(node, parserServices);
	if (simpleType !== undefined) {
		return simpleType;
	}

	// Handle method calls (e.g., vector.mul(2))
	if (node.type === AST_NODE_TYPES.CallExpression) {
		return getRobloxTypeFromMethodCall(node, parserServices);
	}

	// Handle binary expressions (avoid infinite recursion)
	if (node.type === AST_NODE_TYPES.BinaryExpression) {
		return getRobloxTypeFromBinaryExpr(node, parserServices);
	}

	return undefined;
}

function getSimpleRobloxType(
	node: TSESTree.Node,
	parserServices: ParserServicesWithTypeInformation,
): string | undefined {
	const type = getConstrainedTypeAtLocation(parserServices, node);
	return getRobloxDataTypeNameRecursive(type);
}

function handleBinaryExpression(
	node: TSESTree.BinaryExpression,
	context: Readonly<TSESLint.RuleContext<string, []>>,
	parserServices: ParserServicesWithTypeInformation,
): void {
	const { left, operator, right } = node;

	if (shouldSkipOperation(operator)) {
		return;
	}

	const leftDataType = getRobloxTypeName(left, parserServices);
	const rightDataType = getRobloxTypeName(right, parserServices);

	// Early return if neither operand is a Roblox type
	if (leftDataType === undefined && rightDataType === undefined) {
		return;
	}

	processMathOperation({
		context,
		leftDataType,
		node,
		operands: { left, operator, right },
		rightDataType,
	});
}

function handleUnaryExpression(
	node: TSESTree.UnaryExpression,
	context: Readonly<TSESLint.RuleContext<string, []>>,
	parserServices: ParserServicesWithTypeInformation,
): void {
	const argumentDataType = getRobloxTypeName(node.argument, parserServices);
	if (argumentDataType === undefined) {
		return;
	}

	const violationType =
		unaryOperationSupport.get(argumentDataType) === true ? "unary-operation" : "unsupported";

	reportViolation({ context, node, operator: node.operator, type: violationType });
}

function isNumberConstraint(
	constraints: OperationConstraint,
	otherType: string | undefined,
	otherNode: TSESTree.Node,
): boolean {
	return (
		constraints.acceptedTypes === "number" &&
		(otherType === undefined || isNumericLiteral(otherNode))
	);
}

function isNumericLiteral(node: TSESTree.Node): boolean {
	return node.type === AST_NODE_TYPES.Literal && typeof node.value === "number";
}

function isSameTypeConstraint(
	constraints: OperationConstraint,
	otherType: string | undefined,
	thisType: string,
): boolean {
	return constraints.acceptedTypes === "same" && otherType === thisType;
}

function isTypeInList(
	constraints: OperationConstraint,
	otherType: string | undefined,
	otherNode: TSESTree.Node,
): boolean {
	if (!Array.isArray(constraints.acceptedTypes)) {
		return false;
	}

	// Check if number is in the accepted types and other is numeric
	if (
		constraints.acceptedTypes.includes("number") &&
		(otherType === undefined || isNumericLiteral(otherNode))
	) {
		return true;
	}

	// Check if other type is in the accepted list
	return otherType !== undefined && constraints.acceptedTypes.includes(otherType);
}

function processMathOperation({
	context,
	leftDataType,
	node,
	operands,
	rightDataType,
}: MathOperationParameters): void {
	const { left, operator, right } = operands;
	const macroName = mathOperationToMacroName.get(operator);

	// This should not happen due to early check in handleBinaryExpression
	if (macroName === undefined) {
		reportViolation({ context, node, operator, type: "unsupported" });
		return;
	}

	const validation = validateOperation({
		leftNode: left,
		leftType: leftDataType,
		operator,
		rightNode: right,
		rightType: rightDataType,
	});

	const violationContext = createViolationContext({
		context,
		macroName,
		node,
		operator,
		validation,
	});

	reportViolation(violationContext);
}

function reportViolation(violationContext: ViolationContext): void {
	const { context, macroName, node, operator, shouldSwap = false, type } = violationContext;

	if (type === "unsupported") {
		context.report({
			messageId: OTHER_VIOLATION,
			node,
		});
		return;
	}

	// For math-operation and unary-operation types
	const data = {
		method: macroName ?? "mul",
		operator,
	};

	context.report({
		data,
		fix: (fixer) => {
			return createOperatorFix({
				context,
				fixer,
				macroName: macroName ?? "mul",
				node,
				shouldSwap,
			});
		},
		messageId: OBJECT_MATH_VIOLATION,
		node,
	});
}

function shouldSkipOperation(operator: string): boolean {
	return safeOperationSymbols.has(operator);
}

function tryOperandValidation({
	macroName,
	operandType,
	otherNode,
	otherType,
}: ValidationParameters): undefined | ValidationResult {
	const constraints = getOperationConstraints(operandType, macroName);
	if (!constraints) {
		return undefined;
	}

	const isValid = checkConstraints({
		constraints,
		otherNode,
		otherType,
		thisType: operandType,
	});

	return isValid ? createValidationResult(operandType, true, false) : undefined;
}

function trySwappedValidation({
	macroName,
	operandType,
	otherNode,
	otherType,
}: ValidationParameters): undefined | ValidationResult {
	const constraints = getOperationConstraints(operandType, macroName);
	if (constraints?.allowSwapped !== true) {
		return undefined;
	}

	const isValid = checkConstraints({
		constraints,
		otherNode,
		otherType,
		thisType: operandType,
	});

	return isValid ? createValidationResult(operandType, true, true) : undefined;
}

function validateOperation(context: ValidationContext): ValidationResult {
	const { leftNode, leftType, operator, rightNode, rightType } = context;
	const macroName = mathOperationToMacroName.get(operator);

	if (macroName === undefined) {
		return createValidationResult(undefined, false);
	}

	// Check left operand first
	if (leftType !== undefined) {
		const result = tryOperandValidation({
			macroName,
			operandType: leftType,
			otherNode: rightNode,
			otherType: rightType,
		});
		if (result) {
			return result;
		}
	}

	// Check right operand for swappable operations
	if (rightType !== undefined) {
		const result = trySwappedValidation({
			macroName,
			operandType: rightType,
			otherNode: leftNode,
			otherType: leftType,
		});
		if (result) {
			return result;
		}
	}

	return createValidationResult(undefined, false);
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
