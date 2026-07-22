import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { misleadingLuaTupleChecks, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"if (true) {}",
	"if (someVar) {}",
	"if (game.Loaded.Wait()[0]) {}",
	"while (game.Loaded.Wait()[0]) {}",
	"do {} while (game.Loaded.Wait()[0]);",
	"for (const [i] of [1, 2, 3]) {}",
	"for (let i = 0; game.Loaded.Wait()[0]; i++) {}",
	"if (!game.Loaded.Wait()[0]) {}",
	"if (a && game.Loaded.Wait()[0]) {}",
	"if (game.Loaded.Wait()[0] || b) {}",
	'const [player] = game.GetService("Players").PlayerAdded.Wait();',
	'const player = game.GetService("Players").PlayerAdded.Wait()[0];',
	"if (game.Loaded.Wait()[0] === undefined) {}",
	"let player: LuaTuple<[Player]>;",
	'let player: LuaTuple<[Player]>; player = game.GetService("Players").PlayerAdded.Wait();',
	// Relational comparisons on a LuaTuple are already tsc errors (TS2365),
	// so the rule deliberately checks equality operators only.
	"if (game.Loaded.Wait() < 5) {}",
	"if (5 >= game.Loaded.Wait()) {}",
];

const messageId = "misleading-lua-tuple-check";
const declarationId = "lua-tuple-declaration";

const invalid: Array<InvalidTestCase> = [
	{
		code: "if (game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "if (game.Loaded.Wait()[0]) {}",
	},
	{
		code: "const result = game.Loaded.Wait() ? 1 : 0;",
		errors: [{ messageId }],
		output: "const result = game.Loaded.Wait()[0] ? 1 : 0;",
	},
	{
		code: "const result = game.Loaded.Wait() ? game.Loaded.Wait()[0] : undefined;",
		errors: [{ messageId }],
		output: "const result = game.Loaded.Wait()[0] ? game.Loaded.Wait()[0] : undefined;",
	},
	{
		code: "while (game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "while (game.Loaded.Wait()[0]) {}",
	},
	{
		code: "do {} while (game.Loaded.Wait());",
		errors: [{ messageId }],
		output: "do {} while (game.Loaded.Wait()[0]);",
	},
	{
		code: "for (let i = 0; game.Loaded.Wait(); i++) {}",
		errors: [{ messageId }],
		output: "for (let i = 0; game.Loaded.Wait()[0]; i++) {}",
	},
	{
		code: "for (const x of game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "for (const x of game.Loaded.Wait()[0]) {}",
	},
	{
		code: "if (!game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "if (!game.Loaded.Wait()[0]) {}",
	},
	{
		code: "if (a && game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "if (a && game.Loaded.Wait()[0]) {}",
	},
	{
		code: "if (game.Loaded.Wait() || b) {}",
		errors: [{ messageId }],
		output: "if (game.Loaded.Wait()[0] || b) {}",
	},
	{
		code: "if (game.Loaded.Wait() && game.Loaded.Wait()) {}",
		errors: [{ messageId }, { messageId }],
		output: "if (game.Loaded.Wait()[0] && game.Loaded.Wait()[0]) {}",
	},
	{
		code: "if (a ?? game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "if (a ?? game.Loaded.Wait()[0]) {}",
	},
	{
		code: "if (game.Loaded.Wait() ?? b) {}",
		errors: [{ messageId }],
		output: "if (game.Loaded.Wait()[0] ?? b) {}",
	},
	{
		code: "if (game.Loaded.Wait() && game.Loaded.Wait()[0]) {}",
		errors: [{ messageId }],
		output: "if (game.Loaded.Wait()[0] && game.Loaded.Wait()[0]) {}",
	},
	{
		code: "if (game.Loaded.Wait() === undefined) {}",
		errors: [{ messageId }],
		output: "if (game.Loaded.Wait()[0] === undefined) {}",
	},
	{
		code: "if (undefined === game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "if (undefined === game.Loaded.Wait()[0]) {}",
	},
	{
		code: "const isDone = game.Loaded.Wait() !== undefined;",
		errors: [{ messageId }],
		output: "const isDone = game.Loaded.Wait()[0] !== undefined;",
	},
	{
		code: 'const player = game.GetService("Players").PlayerAdded.Wait();',
		errors: [{ messageId: declarationId }],
		output: 'const [player] = game.GetService("Players").PlayerAdded.Wait();',
	},
	{
		code: 'const player: LuaTuple<[Player]> = game.GetService("Players").PlayerAdded.Wait();',
		errors: [{ messageId: declarationId }],
		output: 'const [player]: LuaTuple<[Player]> = game.GetService("Players").PlayerAdded.Wait();',
	},
	{
		code: 'let player: Player; player = game.GetService("Players").PlayerAdded.Wait();',
		errors: [{ messageId: declarationId }],
		output: 'let player: Player; [player] = game.GetService("Players").PlayerAdded.Wait();',
	},
	{
		code: 'for (const x of "I am so cool".gmatch("%S+"));',
		errors: [{ messageId: declarationId }],
		output: 'for (const [x] of "I am so cool".gmatch("%S+"));',
	},
	{
		code: 'let x; for (x of "I am so cool".gmatch("%S+")) {}',
		errors: [{ messageId: declarationId }],
		output: 'let x; for ([x] of "I am so cool".gmatch("%S+")) {}',
	},
	{
		// Two reports, matching pre-optimization behavior: the declaration and
		// the inline Wait() operand. The combined single-pass fix output is
		// known to be imperfect (destructure + [0] together) but is unchanged
		// from the previous implementation.
		code: "declare const maybe: LuaTuple<[Player]> | undefined; const x = maybe ?? game.GetService('Players').PlayerAdded.Wait();",
		errors: [{ messageId: declarationId }, { messageId }],
		output: "declare const maybe: LuaTuple<[Player]> | undefined; const [x] = maybe ?? game.GetService('Players').PlayerAdded.Wait()[0];",
	},
	{
		code: "declare const cond: boolean; if (cond ? game.Loaded.Wait() : game.Loaded.Wait()) {}",
		errors: [{ messageId }],
		output: "declare const cond: boolean; if ((cond ? game.Loaded.Wait() : game.Loaded.Wait())[0]) {}",
	},
	{
		code: "function guard<T extends LuaTuple<[number]>>(value: T) { if (value) {} }",
		errors: [{ messageId }],
		output: "function guard<T extends LuaTuple<[number]>>(value: T) { if (value[0]) {} }",
	},
	{
		code: "function generic<T extends Array<string>>(value: LuaTuple<T>) { if (value) {} }",
		errors: [{ messageId }],
		output: "function generic<T extends Array<string>>(value: LuaTuple<T>) { if (value[0]) {} }",
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: misleadingLuaTupleChecks,
	valid,
});
