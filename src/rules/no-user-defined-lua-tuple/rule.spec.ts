import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noUserDefinedLuaTuple, RULE_NAME } from "./rule";

const messageId = "violation";

const valid: Array<ValidTestCase> = [
	"type MyTuple = [string, number];",
	"interface SomethingElse { foo: string; }",
	"type NotLuaTuple = { LuaTuple: string }",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "type X = LuaTuple<[string, number]>;",
		errors: [{ messageId }],
		output: "type X = [string, number];",
	},
	{
		code: "interface LuaTuple<T> { value: T }",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "type LuaTuple<T> = T[];",
		errors: [{ messageId }],
		output: null,
	},
	{
		code: "function foo(): LuaTuple<[number, string]> {}",
		errors: [{ messageId }],
		output: "function foo(): [number, string] {}",
	},
	{
		code: "let t: LuaTuple<[boolean]>;",
		errors: [{ messageId }],
		output: "let t: [boolean];",
	},
	{
		code: unindent`
			function bar(): LuaTuple<[number, string]> {
				return [42, "hello"] as LuaTuple<[number, string]>;
			}
		`,
		errors: [{ messageId }, { messageId }],
		output: unindent`
			function bar(): [number, string] {
				return [42, "hello"];
			}
		`,
	},
	{
		code: "class C { prop: LuaTuple<[number]>; }",
		errors: [{ messageId }],
		output: "class C { prop: [number]; }",
	},
	{
		code: "function fn(param: LuaTuple<[string]>): void {}",
		errors: [{ messageId }],
		output: "function fn(param: [string]): void {}",
	},
	{
		code: "let x: LuaTuple;",
		errors: [{ messageId }],
	},
	{
		code: "type ComplexArray = Array<LuaTuple<[string]>>;",
		errors: [{ messageId }],
		output: "type ComplexArray = Array<[string]>;",
	},
	{
		code: "type UnionType = LuaTuple<[number]> | string;",
		errors: [{ messageId }],
		output: "type UnionType = [number] | string;",
	},
	{
		code: "type IntersectionType = LuaTuple<[boolean]> & { extra: string };",
		errors: [{ messageId }],
		output: "type IntersectionType = [boolean] & { extra: string };",
	},
	{
		code: unindent`
			type GenericContainer<T> = { item: T };
			let val: GenericContainer<LuaTuple<[number, string]>>;
		`,
		errors: [{ messageId }],
		output: unindent`
			type GenericContainer<T> = { item: T };
			let val: GenericContainer<[number, string]>;
		`,
	},
	{
		code: "type Y = LuaTuple<[string, number]>;",
		errors: [{ messageId }],
		options: [{ fixToTuple: false }],
		output: null,
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noUserDefinedLuaTuple,
	valid,
});
