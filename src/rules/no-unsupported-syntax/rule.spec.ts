import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noUnsupportedSyntax, RULE_NAME } from "./rule";

const GLOBAL_THIS_VIOLATION = "global-this-violation";
const PROTOTYPE_VIOLATION = "prototype-violation";
const REGEX_LITERAL_VIOLATION = "regex-literal-violation";
const SPREAD_DESTRUCTURING_VIOLATION = "spread-destructuring-violation";
const LABEL_VIOLATION = "label-violation";

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
	"const a = {}; const b = { ...a };",
	"const [a, b] = [1, 2];",
	unindent`
		let x: number;
		let y: number;
		let z: number;
		[x, y, [z]] = [1, 2, [3]];
	`,
	'const truth = ["a", "b", "c", "d", "e", "f", "g"]; [..."abcdefg"]',
	"let x = 0;	const [] = pcall(() => (x = 123));",
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
	{
		code: "const [a, ...b] = [1, 2, 3];",
		errors: [{ messageId: SPREAD_DESTRUCTURING_VIOLATION }],
	},
	{
		code: "const { a, ...b } = { a: 1, b: 2 };",
		errors: [{ messageId: SPREAD_DESTRUCTURING_VIOLATION }],
	},
	{
		code: "const { X, ...etc } = new Vector3();",
		errors: [{ messageId: SPREAD_DESTRUCTURING_VIOLATION }],
	},
	{
		code: "({ a, b, ...{c, d} } = obj);",
		errors: [{ messageId: SPREAD_DESTRUCTURING_VIOLATION }],
	},
	{
		code: "[a, ...[b, ...[c]]] = [1, 2, 3];",
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === SPREAD_DESTRUCTURING_VIOLATION)).toBe(
				true,
			);
		},
	},
	{
		code: unindent`
			let str = "";
			loop1: for (let i = 0; i < 5; i++) {
				if (i === 1) {
					continue loop1;
				}

				str = str + i;
			}
		`,
		errors: [{ messageId: LABEL_VIOLATION }],
	},
	{
		code: "myBlock: { const x = 1; }",
		errors: [{ messageId: LABEL_VIOLATION }],
	},
	{
		code: "myBlock: { if (true) break myBlock; }",
		errors: [{ messageId: LABEL_VIOLATION }],
	},
	{
		code: "myLabel: print('test');",
		errors: [{ messageId: LABEL_VIOLATION }],
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: noUnsupportedSyntax,
	valid,
});
