import { beforeAll, describe, expect, it } from "vitest";

import { nonTypeAwareRules, plugin, PLUGIN_NAME } from "../plugin";
import {
	ensureOxlintPluginBuilt,
	runOxlint,
	runOxlintPerDirectoryOptions,
	runOxlintRegistration,
} from "./test";

const ANY_FIXTURE = "let a: any;\n";
const ANY_FIXED = "let a: unknown;\n";
const GET_CHILDREN_FIXTURE = "Players.GetChildren();\n";

/**
 * One fixture per rule authored against `createOnce`, used to prove the rule
 * still reports when driven by the real oxlint binary rather than RuleTester.
 */
const FIXTURES: Record<string, string> = {
	"no-any": ANY_FIXTURE,
	"no-enum-merging": "enum Color { Red }\nenum Color { Green }\n",
	"no-export-assignment-let": "let y = 5; export = y;\n",
	"no-for-in": "const obj = { a: 1 };\nfor (const key in obj) { print(key); }\n",
	"no-function-expression-name": "const x = function foo() {};\n",
	"no-get-set": "class A { get prop() { return 1; } }\n",
	"no-implicit-self": "foo:bar();\n",
	"no-invalid-identifier": "const and = true;\n",
	"no-namespace-merging":
		"namespace Merged { export const a = 1; }\nnamespace Merged { export const b = 2; }\n",
	"no-null": "let a = null;\n",
	"no-private-identifier": "class MyClass { #privateField = 1; }\n",
	"no-unsupported-syntax": "const g = globalThis;\n",
	"no-user-defined-lua-tuple": "type LuaTuple<T> = T;\n",
	"no-value-typeof": "typeof a;\n",
	"prefer-get-players": GET_CHILDREN_FIXTURE,
	"prefer-task-library": "wait();\n",
};

describe("oxlint integration", () => {
	beforeAll(() => {
		ensureOxlintPluginBuilt();
	}, 300_000);

	it("maps every non-type-aware rule to a createOnce rule with a fixture", () => {
		const converted = Object.entries(plugin.rules)
			.filter(([, rule]) => "createOnce" in rule)
			.map(([name]) => name);

		const expected = Object.keys(nonTypeAwareRules).map((name) =>
			name.slice(PLUGIN_NAME.length + 1),
		);

		expect(converted.toSorted()).toEqual(expected.toSorted());
		expect(Object.keys(FIXTURES).toSorted()).toEqual(expected.toSorted());
	});

	it("declares defaults in meta.defaultOptions for every rule with options", () => {
		// oxlint reads `meta.defaultOptions` and ignores the deprecated
		// top-level `defaultOptions` entirely. A rule that declares defaults
		// only top-level passes RuleTester but silently loses them under
		// oxlint, so anything with a schema must populate `meta`. Rules keep
		// the top-level copy too: ESLint core only honours `meta` from v9.15,
		// and v8 is still supported.
		const missing = Object.entries(plugin.rules)
			.filter(([name]) => name in FIXTURES)
			.filter(([, rule]) => {
				const { defaultOptions, schema } = rule.meta;
				return Array.isArray(schema) && schema.length > 0 && defaultOptions === undefined;
			})
			.map(([name]) => name);

		expect(missing).toEqual([]);
	});

	describe("registration", () => {
		// oxlint calls `createOnce` eagerly for every rule in the plugin at
		// registration time, so enabling a single rule proves no converted
		// rule's body touches forbidden context, and that the type-aware
		// `create` rules still coexist. RuleTester cannot catch this.
		it.each(Object.keys(FIXTURES))("loads the plugin cleanly with %s enabled", (rule) => {
			const output = runOxlintRegistration(rule);

			expect(output).not.toMatch(/createOnce/i);
			expect(output).not.toMatch(/Failed to load plugin|panicked|Error:/i);
		});
	});

	describe("diagnostics", () => {
		it.each(Object.entries(FIXTURES))("reports %s", (rule, code) => {
			const { diagnostics } = runOxlint({ code, rule });

			expect(diagnostics.length).toBeGreaterThan(0);
			expect(diagnostics[0]!.code).toBe(`${PLUGIN_NAME}(${rule})`);
		});
	});

	describe("fixes", () => {
		it("applies the no-any fix", () => {
			expect(runOxlint({ code: ANY_FIXTURE, rule: "no-any" }).fixed).toBe(ANY_FIXED);
		});

		it("applies the no-implicit-self fix", () => {
			expect(runOxlint({ code: "foo:bar();\n", rule: "no-implicit-self" }).fixed).toBe(
				"foo.bar();\n",
			);
		});

		it("applies the prefer-task-library fix", () => {
			expect(runOxlint({ code: "wait();\n", rule: "prefer-task-library" }).fixed).toBe(
				"task.wait();\n",
			);
		});

		it("applies the prefer-get-players fix", () => {
			expect(
				runOxlint({ code: GET_CHILDREN_FIXTURE, rule: "prefer-get-players" }).fixed,
			).toBe("Players.GetPlayers();\n");
		});
	});

	it("interpolates {{data}} placeholders", () => {
		const { diagnostics } = runOxlint({
			code: "const and = true;\n",
			rule: "no-invalid-identifier",
		});

		expect(diagnostics[0]!.message).toContain("'and'");
		expect(diagnostics[0]!.message).not.toContain("{{");
	});

	describe("options", () => {
		const macroCode = "$tuple(1, 2);\n";

		it("reports the $tuple macro by default", () => {
			const { diagnostics, fixed } = runOxlint({
				code: macroCode,
				rule: "no-user-defined-lua-tuple",
			});

			expect(diagnostics.length).toBeGreaterThan(0);
			expect(fixed).toBe("[1, 2];\n");
		});

		it("allows the $tuple macro when allowTupleMacro is set", () => {
			const { diagnostics, fixed } = runOxlint({
				code: macroCode,
				options: [{ allowTupleMacro: true }],
				rule: "no-user-defined-lua-tuple",
			});

			expect(diagnostics).toEqual([]);
			expect(fixed).toBe(macroCode);
		});

		it("honours a default that the user did not supply", () => {
			// `fixToUnknown` defaults to true, so the bridge must merge it in.
			expect(runOxlint({ code: ANY_FIXTURE, options: [{}], rule: "no-any" }).fixed).toBe(
				ANY_FIXED,
			);
		});

		it("does not leak one file's options into another in the same run", () => {
			// `createOnce` runs once per run, but the bridge caches merged
			// options per file. If that cache outlived a file, both directories
			// would be fixed the same way.
			const fixed = runOxlintPerDirectoryOptions("no-any", ANY_FIXTURE, {
				fix: [{ fixToUnknown: true }],
				nofix: [{ fixToUnknown: false }],
			});

			expect(fixed).toEqual({ fix: ANY_FIXED, nofix: ANY_FIXTURE });
		});

		it("reaches the type-aware path when prefer-get-players opts in", () => {
			// `validateType` is ESLint-only: it calls `getParserServices`, which
			// oxlint cannot satisfy, so the run yields a plugin error and no
			// diagnostics. That is itself the assertion — reaching the throwing
			// branch proves the option was read per file. Had the rule captured
			// its default in the `createOnce` body, `validateType` would be
			// stuck at `false` and this would report a normal violation.
			const { diagnostics } = runOxlint({
				code: GET_CHILDREN_FIXTURE,
				options: [{ validateType: true }],
				rule: "prefer-get-players",
			});

			expect(diagnostics).toEqual([]);
		});

		it("honours an explicit override of a default", () => {
			expect(
				runOxlint({
					code: ANY_FIXTURE,
					options: [{ fixToUnknown: false }],
					rule: "no-any",
				}).fixed,
			).toBe(ANY_FIXTURE);
		});
	});
});
