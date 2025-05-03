import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { misleadingLuaTupleChecks, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"if (true) {}",
	"if (someVar) {}",
	"if (myTuple[0]) {}",
	"const result = myTuple ? myTuple[0] : undefined;",
	"while (myTuple[0]) {}",
	"do {} while (myTuple[0]);",
	"for (let i = 0; myTuple[0]; i++) {}",
	"if (!myTuple[0]) {}",
	"if (a && myTuple[0]) {}",
	"if (myTuple[0] || b) {}",
];

const messageId = "misleading-lua-tuple-check";

const invalid: Array<InvalidTestCase> = [
	{
		code: "declare const myTuple: LuaTuple<[boolean, number]>; if (myTuple) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean, number]>; if (myTuple[0]) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[string]>; const result = myTuple ? 1 : 0;",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[string]>; const result = myTuple[0] ? 1 : 0;",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; while (myTuple) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; while (myTuple[0]) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; do {} while (myTuple);",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; do {} while (myTuple[0]);",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; for (let i = 0; myTuple; i++) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; for (let i = 0; myTuple[0]; i++) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (!myTuple) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (!myTuple[0]) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (a && myTuple) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (a && myTuple[0]) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple || b) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple[0] || b) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple && myTuple) {}",
		errors: [{ messageId }, { messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple[0] && myTuple[0]) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (a ?? myTuple) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (a ?? myTuple[0]) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple ?? b) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple[0] ?? b) {}",
	},
	{
		code: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple && myTuple[0]) {}",
		errors: [{ messageId }],
		output: "declare const myTuple: LuaTuple<[boolean]>; if (myTuple[0] && myTuple[0]) {}",
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: misleadingLuaTupleChecks,
	valid,
});
