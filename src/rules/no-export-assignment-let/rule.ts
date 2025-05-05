import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-export-assignment-let";

const EXPORT_VIOLATION = "export-violation";

const messages = {
	[EXPORT_VIOLATION]: "Cannot use `export =` on a `let` variable!",
};

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	return {
		TSExportAssignment(node: TSESTree.TSExportAssignment) {
			const { expression } = node;

			if (expression.type !== AST_NODE_TYPES.Identifier) {
				return;
			}

			const variable = context.sourceCode.getScope(node).set.get(expression.name);
			if (variable === undefined) {
				return;
			}

			const parent = variable.defs[0]?.parent;
			if (
				parent &&
				parent.type === AST_NODE_TYPES.VariableDeclaration &&
				parent.kind === "let"
			) {
				context.report({
					messageId: EXPORT_VIOLATION,
					node,
				});
			}
		},
	};
}

export const noExportAssignableLet = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description:
				"Disallow using `export =` on a let variable as it is not supported in roblox-ts",
			recommended: true,
			requiresTypeChecking: false,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
