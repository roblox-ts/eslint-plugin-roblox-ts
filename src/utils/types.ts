import { isBuiltinSymbolLike, isTypeFlagSet } from "@typescript-eslint/type-utils";
import type { TSESTree } from "@typescript-eslint/utils";

import { type Program, type Type, type TypeChecker, TypeFlags } from "typescript";

export type TestExpression =
	| TSESTree.ConditionalExpression
	| TSESTree.DoWhileStatement
	| TSESTree.ForStatement
	| TSESTree.IfStatement
	| TSESTree.WhileStatement;

export function isArrayType(checker: TypeChecker, type: Type): boolean {
	return isTypeRecursive(type, inner => checker.isArrayType(inner) || checker.isTupleType(inner));
}

export function isDefinedType(type: Type): boolean {
	return (
		type.flags === TypeFlags.Object &&
		type.getProperties().length === 0 &&
		type.getCallSignatures().length === 0 &&
		type.getConstructSignatures().length === 0 &&
		type.getNumberIndexType() === undefined &&
		type.getStringIndexType() === undefined
	);
}

export function isEmptyStringType(type: Type): boolean {
	if (type.isStringLiteral()) {
		return type.value === "";
	}

	return isStringType(type);
}

export function isFunction(type: Type): boolean {
	return isTypeFlagSet(type, TypeFlags.Object) && type.getCallSignatures().length > 0;
}

export function isMapType(program: Program, type: Type): boolean {
	return isBuiltinSymbolLike(program, type, ["Map", "ReadonlyMap", "WeakMap"]);
}

export function isNumberLiteralType(type: Type, value: number): boolean {
	if (type.isNumberLiteral()) {
		return type.value === value;
	}

	return isNumberType(type);
}

export function isNumberType(type: Type): boolean {
	return isTypeFlagSet(type, TypeFlags.NumberLike);
}

export function isPossiblyType(type: Type, callback: (type: Type) => boolean): boolean {
	const constrainedType = type.getConstraint() ?? type;
	return isTypeRecursive(constrainedType, innerType => {
		return isUnconstrainedType(innerType) || isDefinedType(innerType) || callback(innerType);
	});
}

export function isSetType(program: Program, type: Type): boolean {
	return isBuiltinSymbolLike(program, type, ["Set", "ReadonlySet", "WeakSet"]);
}

export function isStringType(type: Type): boolean {
	return isTypeFlagSet(type, TypeFlags.StringLike);
}

export function isUnconstrainedType(type: Type): boolean {
	return isTypeFlagSet(type, TypeFlags.Any | TypeFlags.Unknown | TypeFlags.TypeVariable);
}

function isTypeRecursive(type: Type, predicate: (t: Type) => boolean): boolean {
	if (type.isUnionOrIntersection()) {
		return type.types.some(inner => isTypeRecursive(inner, predicate));
	}

	return predicate(type);
}
