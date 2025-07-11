import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-any";

const ANY_VIOLATION = "any-violation";
const SUGGEST_UNKNOWN = "suggest-unknown";

type MessageIds = typeof ANY_VIOLATION | typeof SUGGEST_UNKNOWN;

const messages = {
	[ANY_VIOLATION]: "Type 'any' is not supported in roblox-ts.",
	[SUGGEST_UNKNOWN]:
		"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.",
};

type Context = Readonly<TSESLint.RuleContext<MessageIds, [{ fixToUnknown: boolean }]>>;

function create(
	context: Context,
	[{ fixToUnknown }]: readonly [{ fixToUnknown: boolean }],
): TSESLint.RuleListener {
	return {
		TSAnyKeyword: (node) => {
			const isKeyofAny = isNodeWithinKeyofAny(node);
			if (isKeyofAny) {
				return;
			}

			const fixOrSuggest: {
				fix: null | TSESLint.ReportFixFunction;
				suggest: null | TSESLint.ReportSuggestionArray<MessageIds>;
			} = {
				fix: fixToUnknown ? (fixer) => fixer.replaceText(node, "unknown") : null,
				suggest: [
					{
						fix: (fixer) => fixer.replaceText(node, "unknown"),
						messageId: SUGGEST_UNKNOWN,
					},
				],
			};

			context.report({
				messageId: ANY_VIOLATION,
				node,
				...fixOrSuggest,
			});
		},
	};
}

function isNodeWithinKeyofAny(node: TSESTree.TSAnyKeyword): boolean {
	return node.parent.type === AST_NODE_TYPES.TSTypeOperator && node.parent.operator === "keyof";
}

export const noAny = createEslintRule({
	create,
	defaultOptions: [
		{
			fixToUnknown: true,
		},
	],
	meta: {
		defaultOptions: [
			{
				fixToUnknown: true,
			},
		],
		docs: {
			description: "Disallow values of type `any`. Use `unknown` instead",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		hasSuggestions: true,
		messages,
		schema: [
			{
				additionalProperties: false,
				properties: {
					fixToUnknown: {
						description:
							"Whether to enable auto-fixing in which the `any` type is converted to the `unknown` type.'",
						type: "boolean",
					},
				},
				type: "object",
			},
		],
		type: "problem",
	},
	name: RULE_NAME,
});
