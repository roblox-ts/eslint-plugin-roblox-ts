import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

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
		output: "class A { prop() { return 1; } }",
	},
	{
		code: "class B { set prop(value: number) {} }",
		errors: [{ messageId }],
		output: "class B { prop(value: number) {} }",
	},
	{
		code: "const obj = { get value() { return this._value; }, set value(v) { this._value = v; } };",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class C { static get staticProp() { return 2; } }",
		errors: [{ messageId }],
		output: "class C { static staticProp() { return 2; } }",
	},
	{
		code: "class D { static set staticProp(value: number) {} }",
		errors: [{ messageId }],
		output: "class D { static staticProp(value: number) {} }",
	},
	{
		code: "class E { public get prop() { return 3; } }",
		errors: [{ messageId }],
		output: "class E { public prop() { return 3; } }",
	},
	{
		code: "class F { private get prop() { return 3; } }",
		errors: [{ messageId }],
		output: "class F { private prop() { return 3; } }",
	},
	{
		code: "class G { protected get prop() { return 4; } }",
		errors: [{ messageId }],
		output: "class G { protected prop() { return 4; } }",
	},
	{
		code: "const obj = { get value() { return 1; } };",
		errors: [{ messageId }],
		output: "const obj = { value() { return 1; } };",
	},
	{
		code: "const obj = { set value(v: number) {} };",
		errors: [{ messageId }],
		output: "const obj = { value(v: number) {} };",
	},
	{
		code: "class A { get [key]() { return 1; } }",
		errors: [{ messageId }],
		output: "class A { [key]() { return 1; } }",
	},
	{
		code: "const obj = { get [(key)]() { return 1; } };",
		errors: [{ messageId }],
		output: "const obj = { [(key)]() { return 1; } };",
	},
	{
		code: "class A { get get() { return 1; } }",
		errors: [{ messageId }],
		output: "class A { get() { return 1; } }",
	},
	{
		code: "class A { get value() { return 1; } set value(v: number) {} }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { static get value() { return 1; } static set value(v: number) {} }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: 'class A { get value() { return 1; } set ["value"](v: number) {} }',
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: 'const obj = { get "value"() { return 1; }, set value(v: number) {} };',
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { get #value() { return 1; } set #value(v: number) {} }",
		errors: [{ messageId }, { messageId }],
		output: null,
	},
	{
		code: "class A { static get value() { return 1; } set value(v: number) {} }",
		errors: [{ messageId }, { messageId }],
		output: "class A { static value() { return 1; } value(v: number) {} }",
	},
	{
		code: "class A { get value() { return 1; } } class B { set value(v: number) {} }",
		errors: [{ messageId }, { messageId }],
		output: "class A { value() { return 1; } } class B { value(v: number) {} }",
	},
	{
		code: "class A { @decorate static get value() { return 1; } }",
		errors: [{ messageId }],
		output: "class A { @decorate static value() { return 1; } }",
	},
	{
		code: "class A { get /* get */ value() { return 1; } }",
		errors: [{ messageId }],
		output: "class A { /* get */ value() { return 1; } }",
	},
	{
		code: "class A { get/* comment */[key]() { return 1; } }",
		errors: [{ messageId }],
		output: "class A { /* comment */[key]() { return 1; } }",
	},
	{
		code: "class A { get\n\tvalue() { return 1; } }",
		errors: [{ messageId }],
		output: "class A { value() { return 1; } }",
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: noGetSet,
	valid,
});
