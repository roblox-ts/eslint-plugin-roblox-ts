import { isTypeFlagSet } from "@typescript-eslint/type-utils";

import { type Type, TypeFlags } from "typescript";

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
	return isPossiblyTypeInner(type.getConstraint() ?? type, callback);
}

export function isStringType(type: Type): boolean {
	return isTypeFlagSet(type, TypeFlags.StringLike);
}

function isPossiblyTypeInner(type: Type, predicate: (type: Type) => boolean): boolean {
	if (type.isUnionOrIntersection()) {
		return type.types.some(inner => isPossiblyTypeInner(inner, predicate));
	}

	// type variable without constraint, any, or unknown
	if (isTypeFlagSet(type, TypeFlags.TypeVariable | TypeFlags.Any | TypeFlags.Unknown)) {
		return true;
	}

	// defined type
	if (isDefinedType(type)) {
		return true;
	}

	return predicate(type);
}
