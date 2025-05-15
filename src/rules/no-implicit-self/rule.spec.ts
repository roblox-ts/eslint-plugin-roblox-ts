import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noImplicitSelf, RULE_NAME } from "./rule";

const messageId = "violation";

const valid: Array<ValidTestCase> = [
	"const obj = { x: 5 };",
	"example: console.log('Hello World!');",
	"const foo = { bar: function() {} };",
	"foo.bar();",
	"foo ? bar() : baz();",
	"foo: let x = 1;",
	'foo: "bar";',
	"foo: { a: 1 };",
	"foo: { bar(); }",
	"foo: function x() {};",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "foo:bar();",
		errors: [{ messageId }],
		output: "foo.bar();",
	},
	{
		code: "foo:bar().baz();",
		errors: [{ messageId }],
		output: "foo.bar().baz();",
	},
	{
		code: 'game:GetService("Players").Name',
		errors: [{ messageId }],
		output: 'game.GetService("Players").Name',
	},
	{
		code: "example :foo.bar();",
		errors: [{ messageId }],
		output: "example.foo.bar();",
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noImplicitSelf,
	valid,
});
