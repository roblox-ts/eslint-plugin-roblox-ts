import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import {
	AST_NODE_TYPES,
	type ParserServicesWithTypeInformation,
	type TSESLint,
	type TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import type { Type, TypeChecker } from "typescript";

import { createEslintRule } from "../../util";
import { isMapType, isSetType, isStringType } from "../../utils/types";

export const RULE_NAME = "size-method";

const USE_SIZE_METHOD = "use-size-method";

const messages = {
	[USE_SIZE_METHOD]: "Use .size() instead of .length or .size property for Roblox compatibility.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);
	const checker = parserServices.program.getTypeChecker();

	const { sourceCode } = context;

	return {
		MemberExpression(node: TSESTree.MemberExpression) {
			if (
				node.property.type !== AST_NODE_TYPES.Identifier ||
				(node.property.name !== "length" && node.property.name !== "size") ||
				node.computed
			) {
				return;
			}

			// Prevent fixing if already called as a method
			if (node.parent.type === AST_NODE_TYPES.CallExpression && node.parent.callee === node) {
				return;
			}

			const type = getConstrainedTypeAtLocation(parserServices, node.object);
			const propertyName = node.property.name;
			if (!isTargetType(type, parserServices, checker, propertyName)) {
				return;
			}

			context.report({
				fix: fixer => fixer.replaceText(node, sourceCode.getText(node.object) + ".size()"),
				messageId: USE_SIZE_METHOD,
				node: node.property,
			});
		},
	};
}

function isTargetType(
	type: Type,
	parserServices: ParserServicesWithTypeInformation,
	checker: TypeChecker,
	propertyName: string,
): boolean {
	const { program } = parserServices;

	// For "length" property, only check string and array types
	if (propertyName === "length") {
		return isStringType(type) || checker.isArrayLikeType(type);
	}

	// For "size" property, check Map, Set, WeakMap and WeakSet types
	if (propertyName === "size") {
		return isMapType(program, type) || isSetType(program, type);
	}

	return false;
}

export const sizeMethod = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description:
				"Enforces use of .size() method instead of .length or .size property for Roblox compatibility.",
			recommended: "recommended",
			requiresTypeChecking: true,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
