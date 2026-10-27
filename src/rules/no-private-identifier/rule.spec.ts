import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noPrivateIdentifier, RULE_NAME } from "./rule";

const messageId = "private-identifier-violation";

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
		output: null,
	},
	{
		code: "class MyClass { #privateMethod() {} }",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class MyClass { static #privateStaticMethod() {} }",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { static readonly #value = 5; }",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "class A { #value = 1; read() { return this.#value; } }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { static #x = 1; static read() { return A.#x; } }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { #x = 1; has(obj: object) { return #x in obj; } }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { #x = 1; x = 2; read() { return this.#x; } }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: noPrivateIdentifier,
	valid,
});
