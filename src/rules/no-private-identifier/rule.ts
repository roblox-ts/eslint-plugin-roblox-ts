import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-private-identifier";

const PRIVATE_IDENTIFIER_VIOLATION = "private-identifier-violation";

const messages = {
	[PRIVATE_IDENTIFIER_VIOLATION]:
		"Private identifiers (`#`) are not supported in roblox-ts. Use the 'private' access modifier instead.",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		PrivateIdentifier(node: TSESTree.PrivateIdentifier) {
			context.report({
				fix: fixer => fixer.replaceText(node, `private ${node.name}`),
				messageId: PRIVATE_IDENTIFIER_VIOLATION,
				node,
			});
		},
	};
}

export const noPrivateIdentifier = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow the use of private identifiers (`#`)",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
