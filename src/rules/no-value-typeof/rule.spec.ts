import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noValueTypeof, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"let a = 5;",
	"if (a === 'number') {}",
	"const type = typeOf(a);",
	"const isType = typeIs(a, 'string');",
	"let b = typeof_s;",
];

const errorMessage = "typeof-value-violation";

const invalid: Array<InvalidTestCase> = [
	{
		code: "typeof a;",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (typeof a === 'string') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "const t = typeof (a + b);",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			function check(x: unknown) {
				return typeof x === "object";
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "let t; t = typeof a;",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noValueTypeof,
	valid,
});
