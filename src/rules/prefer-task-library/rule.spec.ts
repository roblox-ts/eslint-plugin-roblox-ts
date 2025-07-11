import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { preferTaskLibrary, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"task.wait()",
	"task.delay(() => {})",
	"task.spawn(() => {})",
	"foo.wait()",
	"foo.delay()",
	"foo.spawn()",
	"waitForChild()",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "wait()",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"task.wait()"');
		},
	},
	{
		code: "delay(() => {})",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"task.delay(() => {})"');
		},
	},
	{
		code: "spawn(() => {})",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"task.spawn(() => {})"');
		},
	},
	{
		code: "const a = wait()",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const a = task.wait()"');
		},
	},
	{
		code: "foo(); wait(); bar();",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"foo(); task.wait(); bar();"');
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: preferTaskLibrary,
	valid,
});
