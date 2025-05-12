import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { misleadingLuaTupleChecks, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"if (true) {}",
	"if (someVar) {}",
	"if (game.Loaded.Wait()[0]) {}",
	"while (game.Loaded.Wait()[0]) {}",
	"do {} while (game.Loaded.Wait()[0]);",
	"for (let i = 0; game.Loaded.Wait()[0]; i++) {}",
	"if (!game.Loaded.Wait()[0]) {}",
	"if (a && game.Loaded.Wait()[0]) {}",
	"if (game.Loaded.Wait()[0] || b) {}",
	'const [player] = game.GetService("Players").PlayerAdded.Wait();',
	'const player = game.GetService("Players").PlayerAdded.Wait()[0];',
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
		code: 'const player = game.GetService("Players").PlayerAdded.Wait();',
		errors: [{ messageId: declarationId }],
		output: 'const [player] = game.GetService("Players").PlayerAdded.Wait();',
	},
	{
		code: 'const player: LuaTuple<[Player]> = game.GetService("Players").PlayerAdded.Wait();',
		errors: [{ messageId: declarationId }],
		output: 'const [player]: LuaTuple<[Player]> = game.GetService("Players").PlayerAdded.Wait();',
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: misleadingLuaTupleChecks,
	valid,
});
