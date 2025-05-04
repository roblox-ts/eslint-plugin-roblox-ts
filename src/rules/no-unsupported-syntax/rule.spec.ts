import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noUnsupportedSyntax, RULE_NAME } from "./rule";

const GLOBAL_THIS_VIOLATION = "global-this-violation";
const PROTOTYPE_VIOLATION = "prototype-violation";
const REGEX_LITERAL_VIOLATION = "regex-literal-violation";

const valid: Array<ValidTestCase> = [
	"const x = 1;",
	"const global = {};",
	"const obj = { prototype: 1 };",
	"const regex = new RegExp('abc');",
	"class Foo {}",
	"Foo.staticMethod();",
	"const proto = 'prototype'; obj[proto];",
	"class Bar {}",
	"_G.Bar = Bar;",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const g = globalThis;",
		errors: [{ messageId: GLOBAL_THIS_VIOLATION }],
	},
	{
		code: "print(globalThis.document);",
		errors: [{ messageId: GLOBAL_THIS_VIOLATION }],
	},
	{
		code: "function MyConstructor() {} const p = MyConstructor.prototype;",
		errors: [{ messageId: PROTOTYPE_VIOLATION }],
	},
	{
		code: "class MyClass {} const proto = MyClass.prototype;",
		errors: [{ messageId: PROTOTYPE_VIOLATION }],
	},
	{
		code: "const regex = /abc/;",
		errors: [{ messageId: REGEX_LITERAL_VIOLATION }],
	},
	{
		code: "const regex = /abc/gi;",
		errors: [{ messageId: REGEX_LITERAL_VIOLATION }],
	},
	{
		code: "if (/test/.test(str)) {}",
		errors: [{ messageId: REGEX_LITERAL_VIOLATION }],
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noUnsupportedSyntax,
	valid,
});
