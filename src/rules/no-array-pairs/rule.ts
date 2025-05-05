import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { createEslintRule } from "../../util";
import { isArrayType } from "../../utils/types";

function makeViolationText(name: string): string {
	return `Do not use Array<T> with ${name}(). Key values will not be shifted from 1-indexed to 0-indexed.`;
}

export const RULE_NAME = "no-array-pairs";

const ARRAY_PAIRS_VIOLATION = "array-pairs-violation";
const ARRAY_IPAIRS_VIOLATION = "array-ipairs-violation";

const messages = {
	[ARRAY_IPAIRS_VIOLATION]: makeViolationText("ipairs"),
	[ARRAY_PAIRS_VIOLATION]: makeViolationText("pairs"),
};

function create(
	context: Readonly<TSESLint.RuleContext<"array-ipairs-violation" | "array-pairs-violation", []>>,
): TSESLint.RuleListener {
	const parserServices = getParserServices(context);
	const checker = parserServices.program.getTypeChecker();

	return {
		'CallExpression[callee.name="ipairs"], CallExpression[callee.name="pairs"]': (
			node: TSESTree.CallExpression,
		): void => {
			if (node.callee.type !== AST_NODE_TYPES.Identifier || !node.arguments[0]) {
				return;
			}

			const type = getConstrainedTypeAtLocation(parserServices, node.arguments[0]);
			if (!isArrayType(checker, type)) {
				return;
			}

			context.report({
				messageId:
					node.callee.name === "pairs" ? ARRAY_PAIRS_VIOLATION : ARRAY_IPAIRS_VIOLATION,
				node,
			});
		},
	};
}

export const noArrayPairs = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallows usage of pairs() and ipairs() with Array<T>",
			recommended: true,
			requiresTypeChecking: true,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
