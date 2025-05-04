// cspell:ignore getvalue, setvalue, getprop, setprop, setstatic, getstatic
import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noGetSet, RULE_NAME } from "./rule";

const messageId = "get-set-violation";

const valid: Array<ValidTestCase> = [
	"class A { method() {} }",
	"const obj = { method() {} };",
	"class B { value = 1; }",
	"const obj2 = { value: 2 };",
	"class C { constructor() {} }",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "class A { get prop() { return 1; } }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"class A { getprop() { return 1; } }"');
		},
	},
	{
		code: "class B { set prop(value: number) {} }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"class B { setprop(value: number) {} }"');
		},
	},
	{
		code: unindent`
	        const obj = {
	            get value() { return this._value; },
	            set value(v) { this._value = v; }
	        };
	    `,
		errors: [{ messageId }, { messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const obj = {
				    getvalue() { return this._value; },
				    setvalue(v) { this._value = v; }
				};"
			`);
		},
	},
	{
		code: "class C { static get staticProp() { return 2; } }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(
				'"class C { static getstaticProp() { return 2; } }"',
			);
		},
	},
	{
		code: "class D { static set staticProp(value: number) {} }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(
				'"class D { static setstaticProp(value: number) {} }"',
			);
		},
	},
	{
		code: unindent`
	        const obj = {
	            get value() { return this._value; },
	            set value(v) { this._value = v; }
	        };
	    `,
		errors: [{ messageId }, { messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const obj = {
				    getvalue() { return this._value; },
				    setvalue(v) { this._value = v; }
				};"
			`);
		},
	},
	{
		code: "class E { public get prop() { return 3; } }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"class E { public getprop() { return 3; } }"');
		},
	},
	{
		code: "class F { private get prop() { return 3; } }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"class F { private getprop() { return 3; } }"');
		},
	},
	{
		code: "class G { protected get prop() { return 4; } }",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"class G { protected getprop() { return 4; } }"');
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noGetSet,
	valid,
});
