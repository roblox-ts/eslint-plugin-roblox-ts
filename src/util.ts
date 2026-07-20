import type { TSESLint } from "@typescript-eslint/utils";
import { applyDefault, RuleCreator } from "@typescript-eslint/utils/eslint-utils";

export const TYPESCRIPT_FILES = ["**/*/*.?([cm])ts", "**/*/*.?([cm])tsx"];

export interface PluginDocumentation {
	description: string;
	recommended?: boolean;
	requiresTypeChecking: boolean;
}

export const createEslintRule = RuleCreator<PluginDocumentation>((name) => {
	return `https://github.com/roblox-ts/eslint-plugin-roblox-ts/tree/main/src/rules/${name}/documentation.md`;
});

/**
 * A rule listener extended with oxlint's `createOnce` per-file lifecycle hooks.
 *
 * `before` runs before AST traversal of each file (returning `false` skips the
 * file); `after` runs once traversal completes. Under oxlint these map to the
 * native hooks; under ESLint {@link createRobloxRule} emulates them.
 */
export type RobloxRuleListener = TSESLint.RuleListener & {
	after?: () => void;
	before?: () => boolean | void;
};

/**
 * An ESLint rule module that additionally carries oxlint's `createOnce` method,
 * so a single definition runs on both linters.
 *
 * @template Options - The rule's options tuple.
 * @template MessageIds - The rule's message identifiers.
 */
export type RobloxRuleModule<
	Options extends ReadonlyArray<unknown>,
	MessageIds extends string,
> = ReturnType<typeof createEslintRule<Options, MessageIds>> & {
	createOnce: (
		context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
	) => RobloxRuleListener;
};

type BaseRule<Options extends ReadonlyArray<unknown>, MessageIds extends string> = Parameters<
	typeof createEslintRule<Options, MessageIds>
>[0];

/**
 * Creates a dual-runtime rule from oxlint's `createOnce` alternative API.
 *
 * The rule is authored once against `createOnce` (oxlint's per-run entry point,
 * where per-file state is created in a `before` hook). The returned module also
 * exposes an ESLint-compatible `create` that delegates to `createOnce` on each
 * file, so the same object works with ESLint's `RuleTester` and the oxlint
 * `jsPlugins` loader alike. Oxlint ignores `create` when `createOnce` is
 * present; ESLint ignores `createOnce`.
 *
 * IMPORTANT: oxlint invokes `createOnce` eagerly for _every_ rule in the plugin
 * at registration time, whether or not the rule is enabled, so a failure in one
 * `createOnce` body takes down the whole plugin. Nothing file-specific exists
 * yet at that point: oxlint throws outright on `context.sourceCode`,
 * `context.filename`, and `context.physicalFilename`, and `context.options` is
 * `null` (destructuring it is what crashes). Read all of them inside a visitor
 * or `before`, never in the body. Visitor _keys_ must likewise be static, since
 * they are fixed for the whole run — gate on options inside the handler rather
 * than conditionally registering a key.
 *
 * Reading `context.options` in a visitor is cheap: this bridge merges
 * `defaultOptions` and caches the result per file, so rules need no `before`
 * hook just to hoist their options.
 *
 * Type-aware rules keep plain {@link createEslintRule}, since they degrade
 * lazily under `create`.
 *
 * @template Options - The rule's options tuple.
 * @template MessageIds - The rule's message identifiers.
 * @param rule - The rule definition (meta, name, defaultOptions, createOnce).
 * @returns A rule module usable by both ESLint and oxlint.
 */
export function createRobloxRule<
	Options extends ReadonlyArray<unknown>,
	MessageIds extends string,
>({
	createOnce,
	...meta
}: Omit<BaseRule<Options, MessageIds>, "create"> & {
	createOnce: (
		context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
	) => RobloxRuleListener;
}): RobloxRuleModule<Options, MessageIds> {
	const createOnceWithDefaults = withMergedOptions(createOnce, meta);

	function create(
		context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
	): TSESLint.RuleListener {
		const { after, before, ...visitors } = createOnceWithDefaults(context);
		if (before !== undefined && before() === false) {
			return {};
		}

		return after === undefined ? visitors : withAfterHook(visitors, after);
	}

	const module = createEslintRule({ ...meta, create } as BaseRule<Options, MessageIds>);

	return Object.assign(module, {
		createOnce: createOnceWithDefaults,
	}) as RobloxRuleModule<Options, MessageIds>;
}

/**
 * Placeholder invalidator for rules that declare no default options, whose
 * context is passed through unwrapped and so has no cache to clear.
 */
function noop(): void {
	// Intentionally empty.
}

/**
 * Chains an oxlint-style `after` hook onto the end of ESLint's traversal.
 *
 * ESLint has no per-file `after` hook, so it runs on `Program:exit` — after any
 * handler the rule already registered there.
 *
 * @param visitors - The visitors returned by `createOnce`, minus the hooks.
 * @param after - The rule's `after` hook.
 * @returns The visitors with `after` chained onto `Program:exit`.
 */
function withAfterHook(visitors: TSESLint.RuleListener, after: () => void): TSESLint.RuleListener {
	const existing = visitors["Program:exit"];
	return {
		...visitors,
		"Program:exit": (node): void => {
			existing?.(node);
			after();
		},
	};
}

/**
 * Wraps a context so `context.options` yields user options merged over the
 * rule's `defaultOptions`, computed at most once per file.
 *
 * This exists for the ESLint path: `RuleCreator` merges defaults only into
 * `create`'s second argument, which `createOnce` never receives, leaving
 * `context.options` raw. Oxlint applies `meta.defaultOptions` itself, so there
 * the merge is a no-op — but routing both runtimes through one wrapper means
 * rules read `context.options` the same way regardless of which is running.
 *
 * Rules deliberately declare their defaults in _both_ `meta.defaultOptions` and
 * the deprecated top-level `defaultOptions`, and neither is redundant: oxlint
 * reads only `meta` and silently ignores the top-level field, while ESLint core
 * only honours `meta.defaultOptions` from v9.15, so v8 — still a supported peer
 * — depends on the top-level one. Dropping either loses defaults on one runtime
 * without failing on the other.
 *
 * Prototype delegation is used in preference to a `Proxy`: oxlint freezes its
 * context, and a `Proxy` `get` trap returning a value that differs from a
 * frozen own _data_ property is a hard `TypeError` invariant violation.
 *
 * The result is cached rather than recomputed per access, so a visitor reading
 * options on every node merges once per file instead of once per node. The
 * cache is per file, not per run: `createOnce` runs once but options vary
 * between files, so {@link createRobloxRule} calls `invalidate` in the `before`
 * hook it injects ahead of the rule's own.
 *
 * @template Options - The rule's options tuple.
 * @template MessageIds - The rule's message identifiers.
 * @param context - The context supplied by ESLint or oxlint.
 * @param rule - The rule definition, whose `meta.defaultOptions` supplies the
 *   defaults — see the note above on why rules declare them twice.
 * @returns The wrapped context and the function that clears its cache.
 */
function withDefaultOptions<Options extends ReadonlyArray<unknown>, MessageIds extends string>(
	context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
	rule: Omit<BaseRule<Options, MessageIds>, "create">,
): {
	invalidate: () => void;
	wrapped: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
} {
	// `meta.defaultOptions` is typed loosely as `readonly unknown[]`; it is the
	// rule's own `Options` by construction.
	const defaultOptions = rule.meta.defaultOptions as Readonly<Options> | undefined;
	if (defaultOptions === undefined || defaultOptions.length === 0) {
		return { invalidate: noop, wrapped: context };
	}

	let cached: Readonly<Options> | undefined;

	const wrapped = Object.create(context, {
		options: {
			get: (): Readonly<Options> => {
				cached ??= applyDefault(defaultOptions, context.options) as Readonly<Options>;
				return cached;
			},
		},
	}) as Readonly<TSESLint.RuleContext<MessageIds, Options>>;

	return {
		invalidate: () => {
			cached = undefined;
		},
		wrapped,
	};
}

/**
 * Wraps a rule's `createOnce` so it receives a context whose `options` are
 * merged with `defaultOptions` and cached for the duration of each file.
 *
 * Both runtimes are routed through this, so rules read `context.options`
 * directly — in a visitor or in `before` — with no per-rule hoisting hook and
 * no repeated merging.
 *
 * @template Options - The rule's options tuple.
 * @template MessageIds - The rule's message identifiers.
 * @param createOnce - The rule's own `createOnce`.
 * @param rule - The rule definition carrying `meta.defaultOptions`.
 * @returns A `createOnce` that supplies merged, per-file-cached options.
 */
function withMergedOptions<Options extends ReadonlyArray<unknown>, MessageIds extends string>(
	createOnce: (
		context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
	) => RobloxRuleListener,
	rule: Omit<BaseRule<Options, MessageIds>, "create">,
): (context: Readonly<TSESLint.RuleContext<MessageIds, Options>>) => RobloxRuleListener {
	return (context) => {
		const { invalidate, wrapped } = withDefaultOptions(context, rule);
		const listener = createOnce(wrapped);

		return {
			...listener,
			before: () => {
				// Runs per file, ahead of the rule's own `before`, so cached
				// options can never outlive the file they were merged for.
				invalidate();
				return listener.before?.();
			},
		};
	};
}
