import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noGetSet, RULE_NAME } from "./rule";

const messageId = "get-set-violation";
const suggestId = "suggest-rename";

interface Expected {
	readonly name?: string;
	readonly output?: string;
}

/**
 * Builds a test case that checks each error and applies its suggestion to the
 * source, since the rule tester does not compute suggestion output.
 *
 * @param code - The source under test.
 * @param expected - Per error: the suggested name and output, or `{}` when no
 *   suggestion is expected.
 * @returns The invalid test case.
 */
function testCase(code: string, expected: Array<Expected>): InvalidTestCase {
	return {
		code,
		errors: (errors) => {
			expect(errors).toHaveLength(expected.length);
			for (const [index, { name, output }] of expected.entries()) {
				const error = errors[index]!;
				expect(error.messageId).toBe(messageId);
				expect(error.fix).toBeUndefined();
				if (name === undefined) {
					expect(error.suggestions ?? []).toHaveLength(0);
					continue;
				}

				expect(error.suggestions).toHaveLength(1);
				const [suggestion] = error.suggestions!;
				expect(suggestion!.messageId).toBe(suggestId);
				expect(suggestion!.desc).toBe(`Rename to \`${name}()\`.`);
				expect(suggestion).toMatchObject({ data: { name } });
				const { range, text } = suggestion!.fix;
				expect(code.slice(0, range[0]) + text + code.slice(range[1])).toBe(output);
			}
		},
		output: null,
	};
}

const valid: Array<ValidTestCase> = [
	"class A { method() {} }",
	"const obj = { method() {} };",
	"class B { value = 1; }",
	"const obj2 = { value: 2 };",
	"class C { constructor() {} }",
	"class D { get() {} set() {} }",
];

const invalid: Array<InvalidTestCase> = [
	testCase("class A { get prop() { return 1; } }", [
		{ name: "getProp", output: "class A { getProp() { return 1; } }" },
	]),
	testCase("class B { set prop(value: number) {} }", [
		{ name: "setProp", output: "class B { setProp(value: number) {} }" },
	]),
	testCase("class C { static get staticProp() { return 2; } }", [
		{ name: "getStaticProp", output: "class C { static getStaticProp() { return 2; } }" },
	]),
	testCase("class D { static set staticProp(value: number) {} }", [
		{ name: "setStaticProp", output: "class D { static setStaticProp(value: number) {} }" },
	]),
	testCase("class E { public get prop() { return 3; } }", [
		{ name: "getProp", output: "class E { public getProp() { return 3; } }" },
	]),
	testCase("class F { private get prop() { return 3; } }", [
		{ name: "getProp", output: "class F { private getProp() { return 3; } }" },
	]),
	testCase("class G { protected set prop(v: number) {} }", [
		{ name: "setProp", output: "class G { protected setProp(v: number) {} }" },
	]),
	testCase(
		unindent`
			const obj = {
				get value() { return this._value; },
				set value(v) { this._value = v; }
			};
		`,
		[
			{
				name: "getValue",
				output: unindent`
					const obj = {
						getValue() { return this._value; },
						set value(v) { this._value = v; }
					};
				`,
			},
			{
				name: "setValue",
				output: unindent`
					const obj = {
						get value() { return this._value; },
						setValue(v) { this._value = v; }
					};
				`,
			},
		],
	),
	testCase(
		unindent`
			class H {
				get value() { return 1; }
				set value(v: number) {}
			}
		`,
		[
			{
				name: "getValue",
				output: unindent`
					class H {
						getValue() { return 1; }
						set value(v: number) {}
					}
				`,
			},
			{
				name: "setValue",
				output: unindent`
					class H {
						get value() { return 1; }
						setValue(v: number) {}
					}
				`,
			},
		],
	),
	testCase("class I { @dec static get foo() { return 1; } }", [
		{ name: "getFoo", output: "class I { @dec static getFoo() { return 1; } }" },
	]),
	testCase("class J { get\n\tvalue() { return 1; } }", [
		{ name: "getValue", output: "class J { getValue() { return 1; } }" },
	]),
	testCase("const obj = { set  \t value(v) {} };", [
		{ name: "setValue", output: "const obj = { setValue(v) {} };" },
	]),
	testCase("class K { get get() { return 1; } }", [
		{ name: "getGet", output: "class K { getGet() { return 1; } }" },
	]),
	// A comment between the keyword and the key: no suggestion, so the
	// comment is never lost or moved.
	testCase("class L { get /* c */ value() { return 1; } }", [{}]),
	testCase("class M { get // c\n value() { return 1; } }", [{}]),
	testCase("class N { get [key]() { return 1; } }", [{}]),
	testCase("const obj = { get ['value']() { return 1; } };", [{}]),
	testCase("class O { get 'value'() { return 1; } }", [{}]),
	testCase("const obj = { set 0(v) {} };", [{}]),
	testCase("class P { #v = 1; get #value() { return this.#v; } }", [{}]),
	testCase("class Q extends R { static override get value() { return 1; } }", [
		{
			name: "getValue",
			output: "class Q extends R { static override getValue() { return 1; } }",
		},
	]),
	testCase("class S { get _x() { return 1; } set $y(v) {} }", [
		{ name: "get_x", output: "class S { get_x() { return 1; } set $y(v) {} }" },
		{ name: "set$y", output: "class S { get _x() { return 1; } set$y(v) {} }" },
	]),
	testCase(String.raw`class T { get abc() { return 1; } }`, [
		{ name: "getAbc", output: "class T { getAbc() { return 1; } }" },
	]),
	testCase("const obj = { inner: { get value() { return 1; } } };", [
		{ name: "getValue", output: "const obj = { inner: { getValue() { return 1; } } };" },
	]),
	// The new name is already taken: no suggestion.
	testCase("class U { get value() { return 1; } getValue() { return 2; } }", [{}]),
	testCase("const obj = { get value() { return 1; }, 'getValue': 2 };", [{}]),
];

run({
	name: RULE_NAME,
	invalid,
	rule: noGetSet,
	valid,
});
