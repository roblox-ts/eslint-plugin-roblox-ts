import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noObjectMath, RULE_NAME } from "./rule";

const messageId = "object-math-violation";
const otherViolation = "other-violation";

const valid: Array<ValidTestCase> = [
	// Standard math is allowed
	"const a = 1 + 2;",
	"const b = 5 * 3;",
	"const c = 10 - 4;",
	"const d = 20 / 5;",
	// Allowed operators on Roblox types
	"const v1 = new Vector3(); const v2 = new Vector3(); const eq = v1 === v2;",
	"const c1 = new CFrame(); const c2 = new CFrame(); const neq = c1 !== c2;",
	// Correct usage of macro methods
	"const v3 = new Vector3(1, 2, 3); const v4 = new Vector3(4, 5, 6); const sum = v3.add(v4);",
	"const cf1 = new CFrame(); const cf2 = new CFrame(); const product = cf1.mul(cf2);",
	"const u1 = new UDim2(); const u2 = new UDim2(); const diff = u1.sub(u2);",
	"const vec2 = new Vector2(10, 10); const quotient = vec2.div(2);",
];

const invalid: Array<InvalidTestCase> = [
	// Invalid math operators
	{
		code: "const v1 = new Vector3(); const v2 = new Vector3(); const result = v1 + v2;",
		errors: [{ data: { function: "add", operator: "+" }, messageId }],
		output: output => {
			expect(output).toBe(
				"const v1 = new Vector3(); const v2 = new Vector3(); const result = v1.add(v2);",
			);
		},
	},
	{
		code: "const c1 = new CFrame(); const v3 = new Vector3(); const result = c1 * v3;",
		errors: [{ data: { function: "mul", operator: "*" }, messageId }],
		output: output => {
			expect(output).toBe(
				"const c1 = new CFrame(); const v3 = new Vector3(); const result = c1.mul(v3);",
			);
		},
	},
	{
		code: "const u1 = new UDim2(); const u2 = new UDim2(); const result = u1 - u2;",
		errors: [{ data: { function: "sub", operator: "-" }, messageId }],
		output: output => {
			expect(output).toBe(
				"const u1 = new UDim2(); const u2 = new UDim2(); const result = u1.sub(u2);",
			);
		},
	},
	{
		code: "const vec2 = new Vector2(); const result = vec2 / 2;",
		errors: [{ data: { function: "div", operator: "/" }, messageId }],
		output: output => {
			expect(output).toBe("const vec2 = new Vector2(); const result = vec2.div(2);");
		},
	},
	// Other invalid operators
	{
		code: "const v1 = new Vector3(); const v2 = new Vector3(); const result = v1 > v2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const c1 = new CFrame(); const c2 = new CFrame(); const result = c1 & c2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const u1 = new UDim(); const result = u1 | 5;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const v2int = new Vector2int16(); const result = v2int < 0;",
		errors: [{ messageId: otherViolation }],
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noObjectMath,
	valid,
});
