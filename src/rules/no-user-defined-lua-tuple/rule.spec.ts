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
	},
	{
		code: "interface LuaTuple<T> { value: T }",
		errors: [{ messageId }],
	},
	{
		code: "type LuaTuple<T> = T[];",
		errors: [{ messageId }],
	},
	{
		code: "function foo(): LuaTuple<[number, string]> {}",
		errors: [{ messageId }],
	},
	{
		code: "let t: LuaTuple<[boolean]>;",
		errors: [{ messageId }],
	},
	{
		code: unindent`
			function bar(): LuaTuple<[number, string]> {
				return [42, "hello"] as LuaTuple<[number, string]>;
			}
		`,
		errors: [{ messageId }, { messageId }],
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noUserDefinedLuaTuple,
	valid,
});
