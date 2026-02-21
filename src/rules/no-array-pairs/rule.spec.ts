import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noArrayPairs, RULE_NAME } from "./rule";

const ARRAY_PAIRS_VIOLATION = "array-pairs-violation";
const ARRAY_IPAIRS_VIOLATION = "array-ipairs-violation";

const valid: Array<ValidTestCase> = [
	"const map = new Map<string, string>(); for (const [i] of pairs(map)) {}",
	"const x = {}; for (const [i] of pairs(x)) {}",
	"const x: any; for (const [i] of pairs(x)) {}",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const arr = [1]; for (const i of pairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: "const arr = [1]; for (const i of ipairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_IPAIRS_VIOLATION);
		},
	},
	{
		code: "const arr: number[] = []; for (const i of pairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: "const arr: Array<string> = []; for (const i of ipairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_IPAIRS_VIOLATION);
		},
	},
	{
		code: "const arr = new Array<number>(); for (const i of pairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: "const arr = new Array<string>(); for (const i of ipairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_IPAIRS_VIOLATION);
		},
	},
	{
		code: "function getArr(): number[] { return [1]; } for (const i of pairs(getArr())) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: "function getArr(): Array<string> { return []; } for (const i of ipairs(getArr())) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_IPAIRS_VIOLATION);
		},
	},
	{
		code: "const arr: ReadonlyArray<number> = [1]; for (const i of pairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: "const arr: readonly string[] = ['a']; for (const i of ipairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_IPAIRS_VIOLATION);
		},
	},
	{
		code: "interface Y extends Array<number> {}; const arr: Y = [1]; for (const i of pairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: "let arr: ReadVoxelsArray<number>; for (const i of pairs(arr)) {}",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
	{
		code: unindent`
			interface Y extends Array<number> {}
			function foo(x: Y) {
				for (const [,] of pairs(x)) {}
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(ARRAY_PAIRS_VIOLATION);
		},
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: noArrayPairs,
	valid,
});
