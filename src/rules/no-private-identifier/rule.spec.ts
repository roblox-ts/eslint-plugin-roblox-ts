import tsParser from "@typescript-eslint/parser";
import { TSESLint } from "@typescript-eslint/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { describe, expect, it } from "vitest";

import { run } from "../test";
import { noPrivateIdentifier, RULE_NAME } from "./rule";

const messageId = "private-identifier-violation";

const MANY_NAMES = Array.from({ length: 14 }, (_, index) => `f${index}`);
function buildManyFields(declare: string, read: string): string {
	const fields = MANY_NAMES.map((name) => `${declare + name} = 1;`).join(" ");
	const reads = MANY_NAMES.map((name) => read + name).join(" + ");
	return `class A { ${fields} f() { return ${reads}; } }`;
}

const manyFieldsCode = buildManyFields("#", "this.#");
const manyFieldsOutput = buildManyFields("private ", "this.");

const valid: Array<ValidTestCase> = [
	"class MyClass { publicField = 1; }",
	"class MyClass { private _privateField = 2; }",
	"class MyClass { protected protectedField = 3; }",
	"class MyClass { method() {} }",
	"class MyClass { private _privateMethod() {} }",
	"class MyClass { protected protectedMethod() {} }",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "class MyClass { #privateField = 1; }",
		errors: [{ messageId }],
		output: "class MyClass { private privateField = 1; }",
	},
	{
		code: "class MyClass { #privateMethod() {} }",
		errors: [{ messageId }],
		output: "class MyClass { private privateMethod() {} }",
	},
	{
		code: "class MyClass { static #privateStaticMethod() {} }",
		errors: [{ messageId }],
		output: "class MyClass { private static privateStaticMethod() {} }",
	},
	{
		code: "class A { static readonly #privateStaticMethod = 5; }",
		errors: [{ messageId }],
		output: "class A { private static readonly privateStaticMethod = 5; }",
	},
	{
		code: "class A { async *#gen() {} }",
		errors: [{ messageId }],
		output: "class A { private async *gen() {} }",
	},
	{
		code: "class A { accessor #x = 1; }",
		errors: [{ messageId }],
		output: "class A { private accessor x = 1; }",
	},
	{
		code: "class A { @dec() static #x = 1; }",
		errors: [{ messageId }],
		output: "class A { @dec() private static x = 1; }",
	},
	{
		code: "class A { #value = 1; read() { return this.#value; } }",
		errors: [{ messageId }, { messageId }],
		output: "class A { private value = 1; read() { return this.value; } }",
	},
	{
		code: "class A { read() { return this.#value; } #value = 1; }",
		errors: [{ messageId }, { messageId }],
		output: "class A { read() { return this.value; } private value = 1; }",
	},
	{
		code: "class A { static #x = 1; static read() { return A.#x; } }",
		errors: [{ messageId }, { messageId }],
		output: "class A { private static x = 1; static read() { return A.x; } }",
	},
	{
		code: "class A { get #x() { return 1; } set #x(v) {} f() { this.#x = this.#x; } }",
		errors: [{ messageId }, { messageId }, { messageId }, { messageId }],
		output: "class A { private get x() { return 1; } private set x(v) {} f() { this.x = this.x; } }",
	},
	{
		code: "class A { #x = 1; #y = 2; f() { return this.#x + this.#y; } }",
		errors: [{ messageId }, { messageId }, { messageId }, { messageId }],
		output: "class A { private x = 1; private y = 2; f() { return this.x + this.y; } }",
	},
	{
		code: "class A { #x = 1; f() { return class B { #x = 2; g(b: B) { return b.#x; } }; } }",
		description: "nested class shadows the name",
		errors: [{ messageId }, { messageId }, { messageId }],
		output: "class A { private x = 1; f() { return class B { private x = 2; g(b: B) { return b.x; } }; } }",
	},
	{
		code: "class A { #x = 1; f() { return class { g(a: A) { return a.#x; } }; } }",
		description: "nested class uses the outer name",
		errors: [{ messageId }, { messageId }],
		output: "class A { private x = 1; f() { return class { g(a: A) { return a.x; } }; } }",
	},
	{
		code: "class A { #x = 1; has(obj: object) { return #x in obj; } }",
		description: "brand check has no equivalent",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { #x = 1; x = 2; read() { return this.#x; } }",
		description: "name clash with a member",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { #x = 1; 'x'() {} }",
		description: "name clash with a string key",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { #x = 1; constructor(public x = 2) {} }",
		description: "name clash with a parameter property",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { #constructor() {} }",
		description: "constructor is reserved",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { #constructor = 1; }",
		description: "constructor is reserved for fields",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { static #name = 1; }",
		description: "static name clashes with Function.name",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { #name = 1; }",
		description: "instance name is not a Function property",
		errors: [{ messageId }],
		output: "class A { private name = 1; }",
	},
	{
		code: "class A { x = 1; } class B extends A { #x = 2; }",
		description: "subclass can clash with an inherited member",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: manyFieldsCode,
		description: "many names in one class",
		errors: MANY_NAMES.flatMap(() => [{ messageId }, { messageId }]),
		output: manyFieldsOutput,
	},
	{
		code: "class A { #x = 1; static x = 2; }",
		description: "instance name does not clash with a static member",
		errors: [{ messageId }],
		output: "class A { private x = 1; static x = 2; }",
	},
	{
		code: "class A { static #x = 1; static x = 2; }",
		description: "static name clashes with a static member",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { #x = 1; [`x`]() {} }",
		description: "name clash with a computed template key",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: 'class A { #x = 1; ["x"]() {} }',
		description: "name clash with a computed string key",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "declare const k: string; class A { #x = 1; [k]() {} }",
		description: "computed key that cannot be resolved",
		errors: [{ messageId }],
		output: null,
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: noPrivateIdentifier,
	valid,
});

describe("single pass", () => {
	it("should fix every name of a class in one pass", () => {
		expect.assertions(3);

		const linter = new TSESLint.Linter({ configType: "flat" });
		const messages = linter.verify(
			manyFieldsCode,
			[
				{
					files: ["**/*.ts"],
					languageOptions: { parser: tsParser },
					plugins: { local: { rules: { [RULE_NAME]: noPrivateIdentifier } } },
					rules: { [`local/${RULE_NAME}`]: "error" },
				},
			],
			"file.ts",
		);

		const fixes = new Set(messages.map(({ fix }) => JSON.stringify(fix ?? null)));

		expect(fixes.has("null")).toBe(false);

		expect(messages).toHaveLength(MANY_NAMES.length * 2);
		// Every report carries the same fix, so ESLint applies it in one pass.
		expect(fixes).toHaveLength(1);
	});
});
