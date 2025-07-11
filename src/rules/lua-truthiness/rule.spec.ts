import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { luaTruthiness, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"if (true) {}",
	"if (1) {}",
	"if (false) {}",
	"if (undefined) {}",
	'if ("hello") {}',
	"const x: number | undefined = undefined; const y = x ?? 0;",
	"for (let i = 0; i < 10; i++) {}",
	"let active = true; for (;active;) { active = false; }",
	"for (;undefined;) {}",
	"const arr = [1,2,3]; for (const item of arr) {}",
	"const obj = {a:1, b:2}; for (const key in obj) {}",
];

const errorMessage = "falsy-string-number-check";

const invalid: Array<InvalidTestCase> = [
	{
		code: "if (!0) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (0) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (!NaN) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (-0) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: 'if ("") {}',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			let a = "hello";
			if (a) {};
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (!'') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (!0 && !'') {}",
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === errorMessage)).toBe(true);
		},
	},
	{
		code: "if (0 && '') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors.every((err) => err.messageId === errorMessage)).toBe(true);
		},
	},
	{
		code: "if (0 || '') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors.every((err) => err.messageId === errorMessage)).toBe(true);
		},
	},
	{
		code: "if (0 ?? '') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if ({});",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			const a: (string | number) & (boolean | string);
			if (a) {}
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: `
			function check<T>(a: T) {
				if (a) {}
			}
		`,
		errors: (errors) => {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (!!0) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (!!'') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (0 ? true : false) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (a && 0) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors.every((err) => err.messageId === errorMessage)).toBe(true);
		},
	},
	{
		code: "if (a || '') {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors.every((err) => err.messageId === errorMessage)).toBe(true);
		},
	},
	{
		code: "if ([].size()) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (![].size()) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (``) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "if (!``) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			function y(x: 0 | 1 | 2 | 3) {
				if (x) {}
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			class x {}
			const y = new x();
			if (!y) {}
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			interface y  {}
			let x: y = {};
			if (!x) {}
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: unindent`
			function f(a: number, b: string) {
    			return a && b;
			}

			const x: string | 0 = f(0, "Hello");
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "for (;0;) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "for (;'';) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "for (;NaN;) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "for (let i = 5; i; i--) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "let x = 0; for (;x;) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "let y = ''; for (;y;) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "for (;!0;) { break; }",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
	{
		code: "for (;!'';) { break; }",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toEqual(errorMessage);
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: luaTruthiness,
	valid,
});
