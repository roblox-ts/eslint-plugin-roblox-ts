import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noNull, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"let a = undefined;",
	"const b = 5;",
	"function foo(x: number | undefined) {}",
	"if (a === undefined) {}",
	"const obj = { value: undefined };",
];

const errorMessage = "null-violation";

const invalid: Array<InvalidTestCase> = [
	{
		code: "let a = null;",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
		output: (output) => {
			expect(output).toBe("let a = undefined;");
		},
	},
	{
		code: "if (foo === null) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
		output: (output) => {
			expect(output).toBe("if (foo === undefined) {}");
		},
	},
	{
		code: "const obj = { value: null };",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
		output: (output) => {
			expect(output).toBe("const obj = { value: undefined };");
		},
	},
	{
		code: unindent`
			function foo(x: number | null) {
				return x === null ? 0 : x;
			}
		`,
		errors(errors) {
			expect(errors.length).toBeGreaterThanOrEqual(1);
			expect(errors.every((e) => e.messageId === errorMessage)).toBe(true);
		},
		output: (output) => {
			expect(output).toContain("number | undefined");
			expect(output).toContain("x === undefined ? 0 : x;");
		},
	},
	{
		code: "let n = null, u = undefined;",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
		output: (output) => {
			expect(output).toBe("let n = undefined, u = undefined;");
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noNull,
	valid,
});
