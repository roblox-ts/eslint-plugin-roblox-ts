import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import { createRobloxRule, type RobloxRuleListener } from "../../util";

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

/**
 * Builds the fix/suggestion pair for an `any` keyword.
 *
 * @param node - The offending `any` keyword.
 * @param fixToUnknown - Whether the replacement is applied as an auto-fix
 *   rather than offered only as a suggestion.
 * @returns The `fix` and `suggest` properties to spread into the report.
 */
function buildFixOrSuggest(
	node: TSESTree.TSAnyKeyword,
	fixToUnknown: boolean,
): {
	fix: null | TSESLint.ReportFixFunction;
	suggest: null | TSESLint.ReportSuggestionArray<MessageIds>;
} {
	return {
		fix: fixToUnknown ? (fixer) => fixer.replaceText(node, "unknown") : null,
		suggest: [
			{
				fix: (fixer) => fixer.replaceText(node, "unknown"),
				messageId: SUGGEST_UNKNOWN,
			},
		],
	};
}

function createOnce(context: Context): RobloxRuleListener {
	return {
		TSAnyKeyword: (node) => {
			const isKeyofAny = isNodeWithinKeyofAny(node);
			if (isKeyofAny) {
				return;
			}

			const [{ fixToUnknown }] = context.options;

			context.report({
				messageId: ANY_VIOLATION,
				node,
				...buildFixOrSuggest(node, fixToUnknown),
			});
		},
	};
}

function isNodeWithinKeyofAny(node: TSESTree.TSAnyKeyword): boolean {
	return node.parent.type === AST_NODE_TYPES.TSTypeOperator && node.parent.operator === "keyof";
}

export const noAny = createRobloxRule({
	name: RULE_NAME,
	createOnce,
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
});
