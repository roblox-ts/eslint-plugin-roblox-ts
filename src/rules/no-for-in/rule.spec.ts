import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noForIn, RULE_NAME } from "./rule";

const FOR_IN_VIOLATION = "for-in-violation";

const valid: Array<ValidTestCase> = [
	unindent`
		const obj = { a: 1, b: 2 };
		for (const key of Object.keys(obj)) {
			print(key);
		}
	`,
	unindent`
		const arr = [1, 2, 3];
		for (const value of arr) {
			print(value);
		}
	`,
	unindent`
		const arr = [1, 2, 3];
		arr.forEach(value => {
			print(value);
		});
	`,
	unindent`
		for (let i = 0; i < 5; i++) {
			print(i);
		}
	`,
];

const invalid: Array<InvalidTestCase> = [
	{
		code: unindent`
			const obj = { a: 1, b: 2 };
			for (const key in obj) {
				print(key);
			}
		`,
		errors: [{ messageId: FOR_IN_VIOLATION }],
		output: unindent`
			const obj = { a: 1, b: 2 };
			for (const key of obj) {
				print(key);
			}
		`,
	},
	{
		code: unindent`
			const arr = [1, 2, 3];
			for (const index in arr) {
				print(arr[index]);
			}
		`,
		errors: [{ messageId: FOR_IN_VIOLATION }],
		output: unindent`
			const arr = [1, 2, 3];
			for (const index of arr) {
				print(arr[index]);
			}
		`,
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noForIn,
	valid,
});
