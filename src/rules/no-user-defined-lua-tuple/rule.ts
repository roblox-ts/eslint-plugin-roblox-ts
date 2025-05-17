import { type TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-user-defined-lua-tuple";

const MESSAGE_ID = "violation";

const messages = {
	[MESSAGE_ID]: "Disallow usage of the LuaTuple type keyword.",
};

type Context = Readonly<TSESLint.RuleContext<typeof MESSAGE_ID, [{ fixToTuple: boolean }]>>;

function create(context: Context): TSESLint.RuleListener {
	const { fixToTuple } = context.options[0];

	return {
		'TSInterfaceDeclaration[id.name="LuaTuple"]': (node: TSESTree.TSInterfaceDeclaration) => {
			context.report({
				messageId: MESSAGE_ID,
				node: node.id,
			});
		},
		'TSTypeAliasDeclaration[id.name="LuaTuple"]': (node: TSESTree.TSTypeAliasDeclaration) => {
			context.report({
				messageId: MESSAGE_ID,
				node: node.id,
			});
		},
		'TSTypeReference[typeName.name="LuaTuple"][typeName.type="Identifier"]': (
			node: TSESTree.TSTypeReference,
		) => {
			context.report({
				fix: fixToTuple ? fixer => fixLuaTuple(node, context, fixer) : null,
				messageId: MESSAGE_ID,
				node: node.typeName,
			});
		},
	};
}

function fixLuaTuple(
	node: TSESTree.TSTypeReference,
	context: Context,
	fixer: TSESLint.RuleFixer,
): null | TSESLint.RuleFix {
	const typeArgumentNode = node.typeArguments?.params[0];
	if (!typeArgumentNode) {
		return null;
	}

	const typeArgumentText = context.sourceCode.getText(typeArgumentNode);
	const { parent } = node;

	if (parent.type === TSESTree.AST_NODE_TYPES.TSAsExpression && parent.typeAnnotation === node) {
		const asExpression = parent;
		// If the parent is an AS expression and this node is the type annotation,
		// remove the 'as LuaTuple<...>' part by replacing the range from
		// the end of the expression to the end of the asExpression.
		return fixer.replaceTextRange(
			[asExpression.expression.range[1], asExpression.range[1]],
			"",
		);
	}

	// Otherwise, just replace LuaTuple<...> with ... (the type argument itself)
	return fixer.replaceText(node, typeArgumentText);
}

export const noUserDefinedLuaTuple = createEslintRule({
	create,
	defaultOptions: [
		{
			fixToTuple: true,
		},
	],
	meta: {
		defaultOptions: [
			{
				fixToTuple: true,
			},
		],
		docs: {
			description: "Disallow usage of the LuaTuple type keyword",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		hasSuggestions: false,
		messages,
		schema: [
			{
				additionalProperties: false,
				properties: {
					fixToTuple: {
						description:
							"Whether to enable auto-fixing in which the `LuaTuple` type is converted to a native TypeScript tuple type.",
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
