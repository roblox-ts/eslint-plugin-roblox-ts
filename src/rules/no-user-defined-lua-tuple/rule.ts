import { type TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-user-defined-lua-tuple";

const LUA_TUPLE_VIOLATION = "lua-tuple-violation";
const MACRO_VIOLATION = "tuple-macro-violation";

const messages = {
	[LUA_TUPLE_VIOLATION]: "Disallow usage of the LuaTuple type keyword",
	[MACRO_VIOLATION]: "Disallow usage of the $tuple(...) call",
};

type Context = Readonly<TSESLint.RuleContext<MessageIds, Options>>;
type MessageIds = typeof LUA_TUPLE_VIOLATION | typeof MACRO_VIOLATION;

type Options = [{ allowTupleMacro?: boolean; shouldFix?: boolean }?];

function create(context: Context): TSESLint.RuleListener {
	const { allowTupleMacro = false } = context.options[0] ?? {};

	return {
		...(!allowTupleMacro && {
			'CallExpression[callee.type="Identifier"][callee.name="$tuple"]': function (
				node: TSESTree.CallExpression,
			) {
				report(context, node.callee, MACRO_VIOLATION, (fixer) =>
					fixTupleMacroCall(node, context, fixer),
				);
			},
		}),
		'TSInterfaceDeclaration[id.name="LuaTuple"]': (node: TSESTree.TSInterfaceDeclaration) => {
			report(context, node.id, LUA_TUPLE_VIOLATION);
		},
		'TSTypeAliasDeclaration[id.name="LuaTuple"]': (node: TSESTree.TSTypeAliasDeclaration) => {
			report(context, node.id, LUA_TUPLE_VIOLATION);
		},
		'TSTypeReference[typeName.name="LuaTuple"][typeName.type="Identifier"]': (
			node: TSESTree.TSTypeReference,
		) => {
			handleTypeReference(context, node);
		},
	};
}

function fixLuaTupleType(
	node: TSESTree.TSTypeReference,
	context: Context,
	fixer: TSESLint.RuleFixer,
): null | TSESLint.RuleFix {
	const typeArgumentNode = node.typeArguments?.params[0];
	if (!typeArgumentNode) {
		return null;
	}

	const { sourceCode } = context;
	const typeArgumentText = sourceCode.getText(typeArgumentNode);
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

function fixTupleMacroCall(
	node: TSESTree.CallExpression,
	context: Context,
	fixer: TSESLint.RuleFixer,
): null | TSESLint.RuleFix {
	const { arguments: args } = node;
	if (args.length === 0) {
		return fixer.replaceText(node, "[]");
	}

	const { sourceCode } = context;
	const tupleElements = args.map((argument) => sourceCode.getText(argument)).join(", ");
	const replacementText = `[${tupleElements}]`;

	return fixer.replaceText(node, replacementText);
}

function handleTypeReference(context: Context, node: TSESTree.TSTypeReference): void {
	if (isInDeclareContext(node)) {
		return;
	}

	const { shouldFix = true } = context.options[0] ?? {};

	report(
		context,
		node.typeName,
		LUA_TUPLE_VIOLATION,
		shouldFix ? (fixer) => fixLuaTupleType(node, context, fixer) : null,
	);
}

const DECLARE_CONTEXTS = new Set([
	TSESTree.AST_NODE_TYPES.TSCallSignatureDeclaration,
	TSESTree.AST_NODE_TYPES.TSDeclareFunction,
	TSESTree.AST_NODE_TYPES.TSInterfaceDeclaration,
	TSESTree.AST_NODE_TYPES.TSMethodSignature,
	TSESTree.AST_NODE_TYPES.TSPropertySignature,
]);

function hasDeclareProperty(
	node: TSESTree.Node,
): node is
	| TSESTree.ClassDeclaration
	| TSESTree.FunctionDeclaration
	| TSESTree.TSDeclareFunction
	| TSESTree.TSModuleDeclaration {
	return (
		node.type === TSESTree.AST_NODE_TYPES.VariableDeclaration ||
		node.type === TSESTree.AST_NODE_TYPES.FunctionDeclaration ||
		node.type === TSESTree.AST_NODE_TYPES.ClassDeclaration ||
		node.type === TSESTree.AST_NODE_TYPES.TSModuleDeclaration
	);
}

function isInDeclareContext(node: TSESTree.Node): boolean {
	let current = node.parent;
	while (current) {
		if (
			DECLARE_CONTEXTS.has(current.type) ||
			(hasDeclareProperty(current) && current.declare)
		) {
			return true;
		}

		current = current.parent;
	}

	return false;
}

function report(
	context: Context,
	node: TSESTree.Node,
	messageId: MessageIds,
	fix: null | TSESLint.ReportFixFunction = null,
): void {
	context.report({
		fix,
		messageId,
		node,
	});
}

export const noUserDefinedLuaTuple = createEslintRule({
	name: RULE_NAME,
	create,
	defaultOptions: [
		{
			allowTupleMacro: false,
			shouldFix: true,
		},
	],
	meta: {
		defaultOptions: [
			{
				allowTupleMacro: false,
				shouldFix: true,
			},
		],
		docs: {
			description: "Disallow usage of LuaTuple type keyword and $tuple() calls",
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
					allowTupleMacro: {
						default: false,
						description: "Whether to allow the $tuple(...) macro call",
						type: "boolean",
					},
					shouldFix: {
						default: true,
						description:
							"Whether to enable auto-fixing in which the `LuaTuple` type is converted to a native TypeScript tuple type",
						type: "boolean",
					},
				},
				type: "object",
			},
		],
		type: "suggestion",
	},
});
