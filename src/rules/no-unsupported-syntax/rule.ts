import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-unsupported-syntax";

const GLOBAL_THIS_VIOLATION = "global-this-violation";
const LABEL_VIOLATION = "label-violation";
const PROTOTYPE_VIOLATION = "prototype-violation";
const REGEX_LITERAL_VIOLATION = "regex-literal-violation";
const SPREAD_DESTRUCTURING_VIOLATION = "spread-destructuring-violation";

const messages = {
	[GLOBAL_THIS_VIOLATION]: "`globalThis` is not supported in roblox-ts.",
	[LABEL_VIOLATION]: "`label` is not supported in roblox-ts.",
	[PROTOTYPE_VIOLATION]: "`.prototype` is not supported in roblox-ts.",
	[REGEX_LITERAL_VIOLATION]: "Regex literals are not supported in roblox-ts",
	[SPREAD_DESTRUCTURING_VIOLATION]: "Operator `...` is not supported for destructuring!",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		ArrayPattern: node => {
			reportInvalidSpreadDestructure(context, node);
		},
		Identifier: node => {
			reportGlobalThisViolation(context, node);
		},
		LabeledStatement: node => {
			reportInvalidLabeledStatement(context, node);
		},
		Literal: node => {
			reportRegexViolation(context, node);
		},
		MemberExpression: node => {
			reportPrototypeViolation(context, node);
		},
		ObjectPattern: node => {
			reportInvalidSpreadDestructure(context, node);
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

function reportInvalidLabeledStatement(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.LabeledStatement,
): void {
	context.report({
		messageId: LABEL_VIOLATION,
		node,
	});
}

function reportInvalidSpreadDestructure(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	node: TSESTree.ArrayPattern | TSESTree.ObjectPattern,
): void {
	const members = node.type === AST_NODE_TYPES.ArrayPattern ? node.elements : node.properties;

	for (const member of members) {
		if (member?.type === AST_NODE_TYPES.RestElement) {
			context.report({
				messageId: SPREAD_DESTRUCTURING_VIOLATION,
				node: member,
			});
		}
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
			description: "Disallow unsupported syntax in roblox-ts",
			recommended: true,
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
