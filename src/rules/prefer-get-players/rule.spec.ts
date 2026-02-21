import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { preferGetPlayers, RULE_NAME } from "./rule";

const messageId = "get-players-children-violation";

type RuleOptions = readonly [{ validateType: boolean }];

const valid: Array<ValidTestCase<RuleOptions>> = [
	"const players = Players.GetPlayers()",
	"const children = workspace.GetChildren()",
	'Players.FindFirstChild("SomePlayer")',
	"print(players.GetChildren())",
	'print(game.GetService("Players").GetChildren())',
];

const validTypeChecked: Array<ValidTestCase<RuleOptions>> = [
	'const y = game.GetService("Players"); for (const player of y.GetPlayers()) {}',
	'const Players = Instance.new("Part"); print(Players.GetChildren())',
	'function x(players: Omit<Players, "GetPlayers">) { for (const player of players.GetChildren()) {} }',
];

const invalid: Array<InvalidTestCase<RuleOptions>> = [
	{
		code: "for (const player of Players.GetChildren()) {}",
		errors: [{ messageId }],
		output: "for (const player of Players.GetPlayers()) {}",
	},
	{
		code: "const allPlayers = Players.GetChildren()",
		errors: [{ messageId }],
		output: "const allPlayers = Players.GetPlayers()",
	},
	{
		code: "function getPlayers() { return Players.GetChildren() }",
		errors: [{ messageId }],
		output: "function getPlayers() { return Players.GetPlayers() }",
	},
];

const invalidTypeChecked: Array<InvalidTestCase<RuleOptions>> = [
	{
		code: 'const y = game.GetService("Players"); for (const player of y.GetChildren()) {}',
		errors: [{ messageId }],
		output: 'const y = game.GetService("Players"); for (const player of y.GetPlayers()) {}',
	},
	{
		code: 'print(game.GetService("Players").GetChildren())',
		errors: [{ messageId }],
		output: 'print(game.GetService("Players").GetPlayers())',
	},
	{
		code: "function x(alias: Players) { for (const player of alias.GetChildren()) {} }",
		errors: [{ messageId }],
		output: "function x(alias: Players) { for (const player of alias.GetPlayers()) {} }",
	},
	{
		code: "interface G extends Players {}; let x: G; for (const player of x.GetChildren()) {}",
		errors: [{ messageId }],
		output: "interface G extends Players {}; let x: G; for (const player of x.GetPlayers()) {}",
	},
];

run({
	name: RULE_NAME,
	invalid: [
		...invalid,
		...invalidTypeChecked.map((test) => {
			return {
				...(typeof test === "object" ? test : undefined),
				code: typeof test === "string" ? test : test.code,
				options: [{ validateType: true }],
			};
		}),
	],
	rule: preferGetPlayers,
	valid: [
		...valid,
		...validTypeChecked.map((test) => {
			return {
				...(typeof test === "object" ? test : undefined),
				code: typeof test === "string" ? test : test.code,
				options: [{ validateType: true }],
			};
		}),
	],
});
