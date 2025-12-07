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

interface ScopeConfig {
	allowedScopes: Map<string, string>;
	pathAliasScopes: Set<string>;
}

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
 * Build a set of scopes from tsconfig paths configuration.
 *
 * @param paths - The paths mapping from compiler options.
 * @returns Set of scopes defined as path aliases.
 */
function buildPathAliasScopes(
	paths: Readonly<Record<string, Array<string>>> | undefined,
): Set<string> {
	const scopes = new Set<string>();
	if (paths !== undefined) {
		for (const alias of Object.keys(paths)) {
			const scope = extractScope(alias);
			if (scope !== null) {
				scopes.add(scope);
			}
		}
	}

	return scopes;
}

function buildScopeConfig(context: Readonly<TSESLint.RuleContext<string, []>>): ScopeConfig {
	const parserServices = getParserServices(context);
	const { configFilePath, paths, typeRoots } = parserServices.program.getCompilerOptions();
	const baseDirectory =
		typeof configFilePath === "string" ? dirname(configFilePath) : context.cwd;

	return {
		allowedScopes: buildAllowedScopes(typeRoots, baseDirectory),
		pathAliasScopes: buildPathAliasScopes(paths),
	};
}

/**
 * Check if the module source is allowed based on typeRoots and paths.
 *
 * @param context - The ESLint rule context.
 * @param config - The scope configuration.
 * @param node - The AST node.
 * @param source - The module source string.
 */
function checkModuleSource(
	context: Readonly<TSESLint.RuleContext<string, []>>,
	config: ScopeConfig,
	node: TSESTree.Node,
	source: string,
): void {
	if (!isScopedPackage(source)) {
		return;
	}

	const scope = extractScope(source);
	if (scope === null) {
		return;
	}

	// Skip validation for path aliases
	if (config.pathAliasScopes.has(scope)) {
		return;
	}

	const scopePath = config.allowedScopes.get(scope);

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
	const config = buildScopeConfig(context);

	return {
		ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
			checkModuleSource(context, config, node, node.source.value);
		},
		ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
			if (node.source?.value !== undefined) {
				checkModuleSource(context, config, node, node.source.value);
			}
		},
		ImportDeclaration(node: TSESTree.ImportDeclaration) {
			checkModuleSource(context, config, node, node.source.value);
		},
		ImportExpression(node: TSESTree.ImportExpression) {
			if (
				node.source.type === AST_NODE_TYPES.Literal &&
				typeof node.source.value === "string"
			) {
				checkModuleSource(context, config, node, node.source.value);
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
