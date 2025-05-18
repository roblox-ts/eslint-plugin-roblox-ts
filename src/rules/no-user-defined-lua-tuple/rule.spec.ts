import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noUserDefinedLuaTuple, RULE_NAME } from "./rule";

const luaTupleViolation = "lua-tuple-violation";
const tupleMacroViolation = "tuple-macro-violation";

const valid: Array<ValidTestCase> = [
	"type MyTuple = [string, number];",
	"interface SomethingElse { foo: string; }",
	"type NotLuaTuple = { LuaTuple: string }",
	{
		code: "const a = $tuple(1, 'two');",
		options: [{ allowTupleMacro: true }],
	},
	{
		code: "const a = $tuple();",
		options: [{ allowTupleMacro: true }],
	},
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "type X = LuaTuple<[string, number]>;",
		errors: [{ messageId: luaTupleViolation }],
		output: "type X = [string, number];",
	},
	{
		code: "interface LuaTuple<T> { value: T }",
		errors: [{ messageId: luaTupleViolation }],
		output: null,
	},
	{
		code: "type LuaTuple<T> = T[];",
		errors: [{ messageId: luaTupleViolation }],
		output: null,
	},
	{
		code: "function foo(): LuaTuple<[number, string]> {}",
		errors: [{ messageId: luaTupleViolation }],
		output: "function foo(): [number, string] {}",
	},
	{
		code: "let t: LuaTuple<[boolean]>;",
		errors: [{ messageId: luaTupleViolation }],
		output: "let t: [boolean];",
	},
	{
		code: unindent`
			function bar(): LuaTuple<[number, string]> {
				return [42, "hello"] as LuaTuple<[number, string]>;
			}
		`,
		errors: [{ messageId: luaTupleViolation }, { messageId: luaTupleViolation }],
		output: unindent`
			function bar(): [number, string] {
				return [42, "hello"];
			}
		`,
	},
	{
		code: "class C { prop: LuaTuple<[number]>; }",
		errors: [{ messageId: luaTupleViolation }],
		output: "class C { prop: [number]; }",
	},
	{
		code: "function fn(param: LuaTuple<[string]>): void {}",
		errors: [{ messageId: luaTupleViolation }],
		output: "function fn(param: [string]): void {}",
	},
	{
		code: "let x: LuaTuple;",
		errors: [{ messageId: luaTupleViolation }],
	},
	{
		code: "type ComplexArray = Array<LuaTuple<[string]>>;",
		errors: [{ messageId: luaTupleViolation }],
		output: "type ComplexArray = Array<[string]>;",
	},
	{
		code: "type UnionType = LuaTuple<[number]> | string;",
		errors: [{ messageId: luaTupleViolation }],
		output: "type UnionType = [number] | string;",
	},
	{
		code: "type IntersectionType = LuaTuple<[boolean]> & { extra: string };",
		errors: [{ messageId: luaTupleViolation }],
		output: "type IntersectionType = [boolean] & { extra: string };",
	},
	{
		code: unindent`
			type GenericContainer<T> = { item: T };
			let val: GenericContainer<LuaTuple<[number, string]>>;
		`,
		errors: [{ messageId: luaTupleViolation }],
		output: unindent`
			type GenericContainer<T> = { item: T };
			let val: GenericContainer<[number, string]>;
		`,
	},
	{
		code: "type Y = LuaTuple<[string, number]>;",
		errors: [{ messageId: luaTupleViolation }],
		options: [{ fixToTuple: false }],
		output: null,
	},
	{
		code: "const x = $tuple(1, 'hello');",
		errors: [{ messageId: tupleMacroViolation }],
		output: "const x = [1, 'hello'];",
	},
	{
		code: "const y = $tuple();",
		errors: [{ messageId: tupleMacroViolation }],
		output: "const y = [];",
	},
	{
		code: "function getTuple() { return $tuple(true, 123); }",
		errors: [{ messageId: tupleMacroViolation }],
		output: "function getTuple() { return [true, 123]; }",
	},
	{
		code: "const z = $tuple(1, $tuple(2, 3));",
		errors: [{ messageId: tupleMacroViolation }, { messageId: tupleMacroViolation }],
		output: "const z = [1, [2, 3]];",
	},
	{
		code: "const w = $tuple('a', ...['b', 'c']);",
		errors: [{ messageId: tupleMacroViolation }],
		output: "const w = ['a', ...['b', 'c']];",
	},
	{
		code: "const val = $tuple(1, 'two');",
		errors: [{ messageId: tupleMacroViolation }],
		options: [{ allowTupleMacro: false }],
		output: "const val = [1, 'two'];",
	},
	{
		code: unindent`
			function processTuple(): [string, number] {
				const myTuple = $tuple("test", 100);
				return myTuple;
			}
		`,
		errors: [{ messageId: tupleMacroViolation }],
		output: unindent`
			function processTuple(): [string, number] {
				const myTuple = ["test", 100];
				return myTuple;
			}
		`,
	},
	{
		code: "const nested = { data: $tuple(1, $tuple(2, 'inner')) };",
		errors: [{ messageId: tupleMacroViolation }, { messageId: tupleMacroViolation }],
		output: "const nested = { data: [1, [2, 'inner']] };",
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noUserDefinedLuaTuple,
	valid,
});
