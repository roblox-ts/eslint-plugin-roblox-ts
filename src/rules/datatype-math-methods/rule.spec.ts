import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { datatypeMathMethods, RULE_NAME } from "./rule";

const messageId = "math-method";

const valid: Array<ValidTestCase> = [
	unindent`
		const vector1 = new Vector2(1, 2);
		const vector2 = new Vector2(3, 4);
		const result = vector1.add(vector2);
	`,
	unindent`
		const position = new Vector3(0, 0, 0);
		const scaled = position.mul(2);
	`,
	unindent`
		const cf1 = new CFrame();
		const cf2 = new CFrame();
		const result = cf1.mul(cf2);
	`,
	unindent`
		const a = 1;
		const b = 2;
		const result = a + b;
	`,
	unindent`
		const str1 = "hello";
		const str2 = "world";
		const combined = str1 + str2;
	`,
	unindent`
		const vector1 = new Vector2(1, 2);
		const vector2 = new Vector2(3, 4);
		const isEqual = vector1 === vector2;
	`,
];

const invalid: Array<InvalidTestCase> = [
	{
		code: unindent`
			const vector1 = new Vector2(1, 2);
			const vector2 = new Vector2(3, 4);
			const result = vector1 + vector2;
		`,
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const vector1 = new Vector2(1, 2);
				const vector2 = new Vector2(3, 4);
				const result = vector1.add(vector2);"
			`);
		},
	},
	{
		code: unindent`
			const vector = new Vector2(1, 2);
			const scaled = vector * 2;
		`,
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const vector = new Vector2(1, 2);
				const scaled = vector.mul(2);"
			`);
		},
	},
	{
		code: unindent`
			const pos1 = new Vector3(1, 2, 3);
			const pos2 = new Vector3(4, 5, 6);
			const combined = pos1 - pos2;
		`,
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const pos1 = new Vector3(1, 2, 3);
				const pos2 = new Vector3(4, 5, 6);
				const combined = pos1.sub(pos2);"
			`);
		},
	},
	{
		code: unindent`
			const position = new Vector3(1, 2, 3);
			const divided = position / 2;
		`,
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const position = new Vector3(1, 2, 3);
				const divided = position.div(2);"
			`);
		},
	},
	{
		code: unindent`
			const cf1 = new CFrame();
			const cf2 = new CFrame();
			const result = cf1 * cf2;
		`,
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
				"const cf1 = new CFrame();
				const cf2 = new CFrame();
				const result = cf1.mul(cf2);"
			`);
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: datatypeMathMethods,
	valid,
});
