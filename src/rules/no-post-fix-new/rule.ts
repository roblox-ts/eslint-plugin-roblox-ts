import {
	AST_NODE_TYPES,
	type ParserServicesWithTypeInformation,
	type TSESLint,
	type TSESTree,
} from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { isPropertyAccessExpression, type TypeChecker } from "typescript";

import { createEslintRule } from "../../util";
import { isFunction } from "../../utils/types";

export const RULE_NAME = "no-post-fix-new";

const NEW_VIOLATION = "new-violation";

const messages = {
	[NEW_VIOLATION]:
		"Calling .new() on objects without a .new() method is probably a mistake. Use `new X()` instead.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);
	const checker = parserServices.program.getTypeChecker();

	return {
		CallExpression(node) {
			handleCallExpression(node, context, parserServices, checker);
		},
	};
}

function handleCallExpression(
	node: TSESTree.CallExpression,
	context: Readonly<TSESLint.RuleContext<string, []>>,
	parserServices: ParserServicesWithTypeInformation,
	checker: TypeChecker,
): void {
	const propertyAccess = parserServices.esTreeNodeToTSNodeMap.get(node.callee);
	if (!isPropertyAccessExpression(propertyAccess) || propertyAccess.name.text !== "new") {
		return;
	}

	// Get the type of the object before .new
	const objectType = checker.getTypeAtLocation(propertyAccess.expression);
	const hasNewProperty = objectType.getProperty("new");

	const hasNewMethod =
		hasNewProperty &&
		isFunction(checker.getTypeOfSymbolAtLocation(hasNewProperty, propertyAccess.expression));

	if (!(hasNewMethod ?? false)) {
		replaceWithNewExpression(context, node);
	}
}

function replaceWithNewExpression(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.CallExpression,
): void {
	context.report({
		fix: (fixer) => {
			const { sourceCode } = context;
			const accessNode = node.callee as TSESTree.MemberExpression;

			const exprText = sourceCode.getText(accessNode.object);
			const argsText = sourceCode.getText().slice(accessNode.range[1], node.range[1]);

			const shouldWrap = !(
				accessNode.object.type === AST_NODE_TYPES.Identifier ||
				(accessNode.object.type === AST_NODE_TYPES.MemberExpression &&
					!accessNode.object.computed)
			);
			const replaced = shouldWrap
				? `new (${exprText})${argsText}`
				: `new ${exprText}${argsText}`;
			return [fixer.replaceText(node, replaced)];
		},
		messageId: NEW_VIOLATION,
		node,
	});
}

export const noPostFixNew = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow .new() on objects without a .new() method",
			recommended: true,
			requiresTypeChecking: true,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
});
