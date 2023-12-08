import { makeRule } from "../util/rules";

export const noForInName = "no-for-in";
export const noForIn = makeRule<[], "forInViolation">({
	name: noForInName,
	meta: {
		type: "problem",
		docs: {
			description: "Disallows iterating with a for-in loop",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		messages: {
			forInViolation:
				"For-in loops are forbidden because it always types the iterator variable as `string`. Use for-of or array.forEach instead.",
		},
		schema: [],
		fixable: "code",
	},
	defaultOptions: [],
	create(context) {
		return {
			ForInStatement(node) {
				context.report({
					node,
					messageId: "forInViolation",
					fix: fix => fix.replaceTextRange([node.left.range[1], node.right.range[0]], " of "),
				});
			},
		};
	},
});
