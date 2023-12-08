import ts from "typescript";
import { getParserServices, makeRule } from "../util/rules";

export const noPrivateIdentifierName = "no-private-identifier";
export const noPrivateIdentifier = makeRule<[], "privateIdentifierViolation">({
	name: noPrivateIdentifierName,
	meta: {
		type: "problem",
		docs: {
			description: "Bans private identifiers from being used",
			recommended: "recommended",
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages: {
			privateIdentifierViolation: "Private identifiers are not supported!",
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		const service = getParserServices(context);
		return {
			PropertyDefinition(node) {
				const tsNode = service.esTreeNodeToTSNodeMap.get(node.key);
				if (ts.isPrivateIdentifier(tsNode)) {
					context.report({
						node: node,
						messageId: "privateIdentifierViolation",
						fix: fixer =>
							fixer.replaceText(node.key, `private ${tsNode.escapedText.toString().substring(1)}`),
					});
				}
			},
		};
	},
});
