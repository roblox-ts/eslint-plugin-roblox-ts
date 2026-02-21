import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { RULE_NAME, sizeMethod } from "./rule";

const valid: Array<ValidTestCase> = [
	// Should not touch unrelated properties
	"const foo = bar.lengthy;",
	"const foo = bar.sized;",
	// Should not touch computed properties
	"const foo = new Array()['length'];",
	"const foo = new Array()['size'];",
	// Should not touch function calls
	"const foo = new Array().length();",
	"const foo = new Set().size();",
	// Should not touch non-builtins
	"const x = { length: 5 }; const foo = x.length;",
	"const x = { length: 5 }; const foo = x.size;",
	// Should not touch non-array types
	"const x: any; print(x.length);",
	"const x: any; print(x.size);",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const n = new Array().length;",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const n = new Array().size();"');
		},
	},
	{
		code: "const n = [].length;",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const n = [].size();"');
		},
	},
	{
		code: 'const n = "".length;',
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const n = "".size();"');
		},
	},
	{
		code: "const y = new Set().size;",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const y = new Set().size();"');
		},
	},
	{
		code: "const n = new Set(); print(n.size);",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const n = new Set(); print(n.size());"');
		},
	},
	{
		code: "const n = new Map().size;",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const n = new Map().size();"');
		},
	},
	{
		code: "const n = new WeakSet().size;",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const n = new WeakSet().size();"');
		},
	},
	{
		code: unindent`
			const x: ReadVoxelsArray<Enum.Material> = Object.assign(
				[[[Enum.Material.Grass]], [[Enum.Material.Sand]], [[Enum.Material.Water]]],
				{ Size: new Vector3(1, 3, 1) },
			);
			print(x.length)
		`,
		output: (output) => {
			expect(output).toMatchInlineSnapshot(
				unindent`
					"const x: ReadVoxelsArray<Enum.Material> = Object.assign(
						[[[Enum.Material.Grass]], [[Enum.Material.Sand]], [[Enum.Material.Water]]],
						{ Size: new Vector3(1, 3, 1) },
					);
					print(x.size())"
				`,
			);
		},
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: sizeMethod,
	valid,
});
