import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ASTUtils } from "@typescript-eslint/utils";

import { createRobloxRule, type RobloxRuleListener } from "../../util";

export const RULE_NAME = "no-get-set";

const GET_SET_VIOLATION = "get-set-violation";
const SUGGEST_RENAME = "suggest-rename";

type MessageIds = typeof GET_SET_VIOLATION | typeof SUGGEST_RENAME;

const messages = {
	[GET_SET_VIOLATION]:
		"Getters and Setters are not supported for performance reasons. Please use a normal method instead.",
	[SUGGEST_RENAME]: "Rename to `{{name}}()`.",
};

type Member = TSESTree.ClassElement | TSESTree.ObjectLiteralElementLike;

/**
 * Builds the rename suggestion for an accessor. Returns `null` when the key is
 * not a plain identifier, when a comment sits between the keyword and the key,
 * or when a sibling member already uses the new name.
 *
 * @param context - The rule context.
 * @param node - The accessor node.
 * @param kind - The accessor kind.
 * @param siblings - The members of the same class body or object literal.
 * @returns The suggestion array, or `null` when no safe rename exists.
 */
function buildSuggestion(
	context: Readonly<TSESLint.RuleContext<MessageIds, []>>,
	node: TSESTree.MethodDefinition | TSESTree.Property,
	kind: "get" | "set",
	siblings: ReadonlyArray<Member>,
): null | TSESLint.ReportSuggestionArray<MessageIds> {
	const { key, computed } = node;
	if (computed || key.type !== AST_NODE_TYPES.Identifier) {
		return null;
	}

	const { sourceCode } = context;
	const keyword = sourceCode.getTokenBefore(key);
	if (keyword === null || sourceCode.commentsExistBetween(keyword, key)) {
		return null;
	}

	const name = prefixName(kind, key.name);
	if (siblings.some((member) => getMemberNames(member).includes(name))) {
		return null;
	}

	return [
		{
			data: { name },
			fix: (fixer) => fixer.replaceTextRange([keyword.range[0], key.range[1]], name),
			messageId: SUGGEST_RENAME,
		},
	];
}

function createOnce(context: Readonly<TSESLint.RuleContext<MessageIds, []>>): RobloxRuleListener {
	function checkMethodDefinition(nodes: Array<Member>): void {
		for (const node of nodes) {
			if (
				(node.type === AST_NODE_TYPES.MethodDefinition ||
					node.type === AST_NODE_TYPES.Property) &&
				(node.kind === "get" || node.kind === "set")
			) {
				context.report({
					messageId: GET_SET_VIOLATION,
					node,
					suggest: buildSuggestion(context, node, node.kind, nodes),
				});
			}
		}
	}

	return {
		ClassBody: (node) => {
			checkMethodDefinition(node.body);
		},
		ObjectExpression: (node) => {
			checkMethodDefinition(node.properties);
		},
	};
}

function getMemberNames(member: Member): Array<null | string> {
	if (member.type === AST_NODE_TYPES.MethodDefinition && member.kind === "constructor") {
		return member.value.params.map(getParameterPropertyName);
	}

	if (
		member.type !== AST_NODE_TYPES.MethodDefinition &&
		member.type !== AST_NODE_TYPES.Property &&
		member.type !== AST_NODE_TYPES.PropertyDefinition &&
		member.type !== AST_NODE_TYPES.AccessorProperty &&
		member.type !== AST_NODE_TYPES.TSAbstractMethodDefinition &&
		member.type !== AST_NODE_TYPES.TSAbstractPropertyDefinition &&
		member.type !== AST_NODE_TYPES.TSAbstractAccessorProperty
	) {
		return [];
	}

	const { key, computed } = member;
	return [
		!computed && key.type === AST_NODE_TYPES.Identifier
			? key.name
			: ASTUtils.getStringIfConstant(key),
	];
}

function getParameterPropertyName(parameter: TSESTree.Parameter): null | string {
	if (parameter.type !== AST_NODE_TYPES.TSParameterProperty) {
		return null;
	}

	const { parameter: property } = parameter;
	return property.type === AST_NODE_TYPES.AssignmentPattern ? property.left.name : property.name;
}

function prefixName(kind: "get" | "set", name: string): string {
	const [first = "", ...rest] = name;
	const upper = first.toUpperCase();
	return `${kind}${upper.length === first.length ? upper : first}${rest.join("")}`;
}

export const noGetSet = createRobloxRule({
	name: RULE_NAME,
	createOnce,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow getters and setters",
			recommended: true,
			requiresTypeChecking: false,
		},
		hasSuggestions: true,
		messages,
		schema: [],
		type: "problem",
	},
});
