import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-unsupported-syntax";

const GLOBAL_THIS_VIOLATION = "global-this-violation";
const PROTOTYPE_VIOLATION = "prototype-violation";
const REGEX_LITERAL_VIOLATION = "regex-literal-violation";

const messages = {
	[GLOBAL_THIS_VIOLATION]: "`globalThis` is not supported in roblox-ts.",
	[PROTOTYPE_VIOLATION]: "`.prototype` is not supported in roblox-ts.",
	[REGEX_LITERAL_VIOLATION]: "Regex literals are not supported in roblox-ts",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		Identifier(node: TSESTree.Identifier) {
			reportGlobalThisViolation(context, node);
		},
		Literal(node: TSESTree.Literal) {
			reportRegexViolation(context, node);
		},
		MemberExpression(node: TSESTree.MemberExpression) {
			reportPrototypeViolation(context, node);
		},
	};
}

function reportGlobalThisViolation(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.Identifier,
): void {
	if (node.name === "globalThis") {
		context.report({
			messageId: GLOBAL_THIS_VIOLATION,
			node,
		});
	}
}

function reportPrototypeViolation(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.MemberExpression,
): void {
	if (
		node.property.type === AST_NODE_TYPES.Identifier &&
		node.property.name === "prototype" &&
		!node.computed
	) {
		context.report({
			messageId: PROTOTYPE_VIOLATION,
			node: node.property,
		});
	}
}

function reportRegexViolation(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.Literal,
): void {
	const token = context.sourceCode.getFirstToken(node);

	if (token && token.type === AST_TOKEN_TYPES.RegularExpression) {
		context.report({
			messageId: REGEX_LITERAL_VIOLATION,
			node,
		});
	}
}

export const noUnsupportedSyntax = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallows unsupported syntax in roblox-ts.",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
