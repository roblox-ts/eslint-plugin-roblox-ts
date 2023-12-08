import { makeRule } from "../util/rules";

export const noSpreadDestructuringName = "no-spread-destructuring";
export const noSpreadDestructuring = makeRule<[], "spreadDestructuringViolation">({
	name: noSpreadDestructuringName,
	meta: {
		type: "problem",
		docs: {
			description: "Bans spread destructuring from being used",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		messages: {
			spreadDestructuringViolation: "Operator `...` is not supported for destructuring!",
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			ArrayPattern(node) {
				node.elements.forEach(element => {
					if (element?.type == "RestElement") {
						context.report({
							node: node,
							messageId: "spreadDestructuringViolation",
						});
					}
				});
			},
		};
	},
});
