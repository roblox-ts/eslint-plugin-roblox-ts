import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-user-defined-lua-tuple";

const MESSAGE_ID = "violation";

const messages = {
	[MESSAGE_ID]: "Disallow usage of the LuaTuple type keyword.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
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
				messageId: MESSAGE_ID,
				node: node.typeName,
			});
		},
	};
}

export const noUserDefinedLuaTuple = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow usage of the LuaTuple type keyword",
			recommended: false,
			requiresTypeChecking: false,
		},
		fixable: undefined,
		hasSuggestions: false,
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
