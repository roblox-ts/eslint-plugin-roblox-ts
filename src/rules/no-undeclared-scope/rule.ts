import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createEslintRule } from "../../util";

export const RULE_NAME = "no-undeclared-scope";

const UNDECLARED_SCOPE = "undeclaredScope";
const SCOPE_NOT_FOUND = "scopeNotFound";

const messages = {
	[SCOPE_NOT_FOUND]: "Scope {{scope}} is declared in typeRoots but was not found at {{path}}.",
	[UNDECLARED_SCOPE]: "You can only use npm scopes that are listed in your typeRoots.",
};

/**
 * Build a map of allowed scopes from typeRoots configuration.
 *
 * @param typeRoots - The typeRoots from compiler options.
 * @param baseDirectory - The base directory to resolve relative paths.
 * @returns Map of allowed npm scopes to their resolved paths.
 */
function buildAllowedScopes(
	typeRoots: ReadonlyArray<string> | undefined,
	baseDirectory: string,
): Map<string, string> {
	const allowedScopes = new Map<string, string>();
	if (typeRoots !== undefined && typeRoots.length > 0) {
		for (const root of typeRoots) {
			const match = root.match(/@([^/\\]+)$/);
			if (match !== null) {
				const scope = `@${match[1]}`;
				const resolvedPath = resolve(baseDirectory, root);
				allowedScopes.set(scope, resolvedPath);
			}
		}
	}

	return allowedScopes;
}

/**
 * Check if the module source is allowed based on typeRoots.
 *
 * @param allowedScopes - Map of allowed scopes to their resolved paths.
 * @param node - The AST node.
 * @param source - The module source string.
 * @param context - The ESLint rule context.
 */
function checkModuleSource(
	allowedScopes: Map<string, string>,
	node: TSESTree.Node,
	source: string,
	context: Readonly<TSESLint.RuleContext<string, []>>,
): void {
	if (!isScopedPackage(source)) {
		return;
	}

	const scope = extractScope(source);
	if (scope === null) {
		return;
	}

	const scopePath = allowedScopes.get(scope);

	// If scope is not in typeRoots, report undeclared scope error
	if (scopePath === undefined) {
		context.report({ messageId: UNDECLARED_SCOPE, node });
		return;
	}

	// If scope is in typeRoots, check if the directory exists
	if (!existsSync(scopePath)) {
		context.report({
			data: { path: scopePath, scope },
			messageId: SCOPE_NOT_FOUND,
			node,
		});
	}
}

function create(context: Readonly<TSESLint.RuleContext<string, []>>): TSESLint.RuleListener {
	const parserServices = getParserServices(context);
	const compilerOptions = parserServices.program.getCompilerOptions();

	// Get the base directory from the tsconfig location
	const { configFilePath, typeRoots } = compilerOptions;
	const baseDirectory =
		typeof configFilePath === "string" ? dirname(configFilePath) : context.getCwd();

	const allowedScopes = buildAllowedScopes(typeRoots, baseDirectory);

	return {
		ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
			checkModuleSource(allowedScopes, node, node.source.value, context);
		},
		ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
			if (node.source?.value !== undefined) {
				checkModuleSource(allowedScopes, node, node.source.value, context);
			}
		},
		ImportDeclaration(node: TSESTree.ImportDeclaration) {
			checkModuleSource(allowedScopes, node, node.source.value, context);
		},
		ImportExpression(node: TSESTree.ImportExpression) {
			if (
				node.source.type === AST_NODE_TYPES.Literal &&
				typeof node.source.value === "string"
			) {
				checkModuleSource(allowedScopes, node, node.source.value, context);
			}
		},
	};
}

/**
 * Extract the scope from a scoped package name.
 *
 * @example ExtractScope("@flamework/core") // "@flamework"
 *
 * @param source - The module source.
 * @returns The scope or null if not found.
 */
function extractScope(source: string): null | string {
	const match = source.match(/^(@[^/]+)\//);
	return match ? (match[1] ?? null) : null;
}

/**
 * Check if a module source is a scoped package (starts with @scope/).
 *
 * @param source - The module source to check.
 * @returns True if the source is a scoped package.
 */
function isScopedPackage(source: string): boolean {
	return /^@[^/]+\//.test(source);
}

export const noUndeclaredScope = createEslintRule({
	create,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Enforce that only npm scopes listed in typeRoots can be imported",
			recommended: false,
			requiresTypeChecking: true,
		},
		messages,
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});
