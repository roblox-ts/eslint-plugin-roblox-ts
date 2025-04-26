import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { RULE_NAME, sizeMethod } from "./rule";

const valid: Array<ValidTestCase> = [
	// Should not touch unrelated properties
	"const foo = bar.lengthy;",
	"const foo = bar.sized;",
	// Should not touch computed properties
	"const foo = arr['length'];",
	"const foo = set['size'];",
	// Should not touch function calls
	"const foo = arr.length();",
	"const foo = set.size();",
	// Should not touch non-builtins
	"const x = { length: 5 }; const foo = x.length;",
	"const x = { length: 5 }; const foo = x.size;",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const n = arr.length;",
		output: output => {
			expect(output).toBe("const n = arr.size();");
		},
	},
	{
		code: "const n = str.length;",
		output: output => {
			expect(output).toBe("const n = str.size();");
		},
	},
	{
		code: "const y = new Set().size;",
		output: output => {
			expect(output).toBe("const y = new Set().size();");
		},
	},
	{
		code: "const n = new Set(); print(n.size);",
		output: output => {
			expect(output).toBe("const n = new Set(); print(n.size());");
		},
	},
	{
		code: "const n = new Map().size;",
		output: output => {
			expect(output).toBe("const n = new Map().size();");
		},
	},
	{
		code: "const n = new WeakSet().size;",
		output: output => {
			expect(output).toBe("const n = new WeakSet().size();");
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: sizeMethod,
	valid,
});
