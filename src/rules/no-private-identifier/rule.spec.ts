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
		output: "class MyClass { private privateField = 1; }",
	},
	{
		code: "class MyClass { #privateMethod() {} }",
		errors: [{ messageId }],
		output: "class MyClass { private privateMethod() {} }",
	},
	// TODO: Correct access modifier order
	// {
	// 	code: "class MyClass { static #privateStaticMethod() {} }",
	// 	errors: [{ messageId }],
	// 	output: "class MyClass { private static privateStaticMethod() {} }",
	// },
	// {
	// 	code: "class A { static readonly #privateStaticMethod = 5; }",
	// 	errors: [{ messageId }],
	// 	output: "class A { private static readonly privateStaticMethod = 5; }",
	// },
];

run({
	invalid,
	name: RULE_NAME,
	rule: noPrivateIdentifier,
	valid,
});
