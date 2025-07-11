import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noObjectMath, RULE_NAME } from "./rule";

const messageId = "object-math-violation";
const otherViolation = "other-violation";

const valid: Array<ValidTestCase> = [
	"const a = 1 + 2;",
	"const b = 5 * 3;",
	"const c = 10 - 4;",
	"const d = 20 / 5;",
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
	"const v1 = new Vector3(); const v2 = new Vector3(); const eq = v1 === v2;",
	"const c1 = new CFrame(); const c2 = new CFrame(); const neq = c1 !== c2;",
	unindent`
		const vector1 = new Vector2(1, 2);
		const vector2 = new Vector2(3, 4);
		const isEqual = vector1 === vector2;
	`,
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
		const v1 = new Vector2(1, 2);
		const v2 = new Vector2(3, 4);
		const v3 = new Vector2(5, 6);
		const result = v1.add(v2).mul(v3);
	`,
	unindent`
		const pos = new Vector3(1, 2, 3);
		const chained = pos.mul(2).add(new Vector3(1, 1, 1)).div(3);
	`,
	unindent`
		const v3 = new Vector3(1, 2, 3);
		const v4 = new Vector3(4, 5, 6);
		const sum = v3.add(v4);
	`,
	unindent`
		const cf1 = new CFrame();
		const cf2 = new CFrame();
		const product = cf1.mul(cf2);
	`,
	unindent`
		const u1 = new UDim2();
		const u2 = new UDim2();
		const diff = u1.sub(u2);
	`,
	unindent`
		const vec2 = new Vector2(10, 10);
		const quotient = vec2.div(2);
	`,
	unindent`
		const v = new Vector3(1, 2, 3);
		const result = v.add(new Vector3(1, 1, 1)).mul(2);
	`,
	unindent`
		const cf = new CFrame();
		const v3 = new Vector3(1, 2, 3);
		const result = cf.mul(v3);
	`,
	unindent`
		const maybeVector: Vector3 | undefined = undefined;
		const result = maybeVector === undefined;
	`,
	unindent`
		const vectorOrUndefined: Vector3 | undefined = undefined;
		const check = vectorOrUndefined !== undefined;
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
		output: (output) => {
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
		output: (output) => {
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
		output: (output) => {
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
		output: (output) => {
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
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const cf1 = new CFrame();
				const cf2 = new CFrame();
				const result = cf1.mul(cf2);"
			`);
		},
	},
	{
		code: unindent`
			const v1 = new Vector2(1, 2);
			const v2 = new Vector2(3, 4);
			const v3 = new Vector2(5, 6);
			const result = v1 + v2 + v3;
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v1 = new Vector2(1, 2);
				const v2 = new Vector2(3, 4);
				const v3 = new Vector2(5, 6);
				const result = v1.add(v2).add(v3);"
			`);
		},
	},
	{
		code: unindent`
			const pos = new Vector3(1, 2, 3);
			const result = pos * 2 + new Vector3(1, 1, 1);
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const pos = new Vector3(1, 2, 3);
				const result = pos.mul(2).add(new Vector3(1, 1, 1));"
			`);
		},
	},
	{
		code: unindent`
			const v1 = new Vector2(10, 20);
			const v2 = new Vector2(5, 5);
			const complex = v1 - v2 * 2;
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v1 = new Vector2(10, 20);
				const v2 = new Vector2(5, 5);
				const complex = v1.sub(v2.mul(2));"
			`);
		},
	},
	{
		code: unindent`
			const cf = new CFrame();
			const vector = new Vector3(1, 2, 3);
			const combined = cf * vector + vector;
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const cf = new CFrame();
				const vector = new Vector3(1, 2, 3);
				const combined = cf.mul(vector).add(vector);"
			`);
		},
	},
	{
		code: unindent`
			const v1 = new Vector2(1, 2);
			const v2 = new Vector2(3, 4);
			const v3 = new Vector2(5, 6);
			const result = v1 + v2 * v3;
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v1 = new Vector2(1, 2);
				const v2 = new Vector2(3, 4);
				const v3 = new Vector2(5, 6);
				const result = v1.add(v2.mul(v3));"
			`);
		},
	},
	{
		code: unindent`
			const v1 = new Vector2(10, 10);
			const v2 = new Vector2(2, 2);
			const v3 = new Vector2(3, 3);
			const result = v1 / v2 + v3;
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v1 = new Vector2(10, 10);
				const v2 = new Vector2(2, 2);
				const v3 = new Vector2(3, 3);
				const result = v1.div(v2).add(v3);"
			`);
		},
	},
	{
		code: unindent`
			const v = new Vector2(10, 10);
			const result = v + 3 * 4;
		`,
		errors: [{ messageId: otherViolation }],
	},
	{
		code: unindent`
			const a = new Vector2(1, 1);
			const b = new Vector2(2, 2);
			const c = new Vector2(3, 3);
			const d = new Vector2(4, 4);
			const result = a + b * c - d;
		`,
		errors: [{ messageId }, { messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const a = new Vector2(1, 1);
				const b = new Vector2(2, 2);
				const c = new Vector2(3, 3);
				const d = new Vector2(4, 4);
				const result = a.add(b.mul(c)).sub(d);"
			`);
		},
	},
	{
		code: unindent`
			const v1 = new Vector2(1, 2);
			const v2 = new Vector2(3, 4);
			const result = (v1 + v2) * 2;
		`,
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v1 = new Vector2(1, 2);
				const v2 = new Vector2(3, 4);
				const result = (v1.add(v2)).mul(2);"
			`);
		},
	},
	{
		code: "const v1 = new Vector3(); const v2 = new Vector3(); const result = v1 + v2;",
		errors: [{ data: { method: "add", operator: "+" }, messageId }],
		output: (output) => {
			expect(output).toBe(
				"const v1 = new Vector3(); const v2 = new Vector3(); const result = v1.add(v2);",
			);
		},
	},
	{
		code: "const c1 = new CFrame(); const v3 = new Vector3(); const result = c1 * v3;",
		errors: [{ data: { method: "mul", operator: "*" }, messageId }],
		output: (output) => {
			expect(output).toBe(
				"const c1 = new CFrame(); const v3 = new Vector3(); const result = c1.mul(v3);",
			);
		},
	},
	{
		code: "const u1 = new UDim2(); const u2 = new UDim2(); const result = u1 - u2;",
		errors: [{ data: { method: "sub", operator: "-" }, messageId }],
		output: (output) => {
			expect(output).toBe(
				"const u1 = new UDim2(); const u2 = new UDim2(); const result = u1.sub(u2);",
			);
		},
	},
	{
		code: "const vec2 = new Vector2(); const result = vec2 / 2;",
		errors: [{ data: { method: "div", operator: "/" }, messageId }],
		output: (output) => {
			expect(output).toBe("const vec2 = new Vector2(); const result = vec2.div(2);");
		},
	},
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
	{
		code: "const u1 = new UDim(); const u2 = new UDim(); const result = u1 * u2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const u1 = new UDim(); const result = u1 / 2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const u1 = new UDim2(); const u2 = new UDim2(); const result = u1 * u2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const u1 = new UDim2(); const result = u1 / 2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const cf1 = new CFrame(); const result = cf1 / 2;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const cf = new CFrame(); const result = -1 * cf;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "const v = new Vector2(1, 2); const result = 2 * v;",
		errors: [{ messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v = new Vector2(1, 2); const result = v.mul(2);"
			`);
		},
	},
	{
		code: "const cf1 = new CFrame(); const cf2 = new CFrame(); const result = -1 * cf1 * cf2;",
		errors: [{ messageId: otherViolation }, { messageId: otherViolation }],
	},
	{
		code: "const v1 = new Vector3(1, 2, 3); const v2 = new Vector3(4, 5, 6); const result = 2 * v1 + v2;",
		errors: [{ messageId }, { messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const v1 = new Vector3(1, 2, 3); const v2 = new Vector3(4, 5, 6); const result = v1.mul(2).add(v2);"
			`);
		},
	},
	{
		code: "const vector = new Vector3(1, 2, 3); const negated = -vector;",
		errors: [{ messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"const vector = new Vector3(1, 2, 3); const negated = vector.mul(-1);"
			`);
		},
	},
	{
		code: "const cf = new CFrame(); const negated = -cf;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: "function getVector() { return new Vector3(); } const result = getVector() + new Vector3();",
		errors: [{ messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"function getVector() { return new Vector3(); } const result = getVector().add(new Vector3());"
			`);
		},
	},
	{
		code: "const v2 = new Vector2(); const v3 = new Vector3(); const result = v2 + v3;",
		errors: [{ messageId: otherViolation }],
	},
	{
		code: unindent`
			function testUnion() {
				const maybeVector: Vector3 | undefined = new Vector3(1, 2, 3);
				if (maybeVector) {
					const result = maybeVector + new Vector3(1, 1, 1);
				}
			}
		`,
		errors: [{ messageId }],
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"function testUnion() {
					const maybeVector: Vector3 | undefined = new Vector3(1, 2, 3);
					if (maybeVector) {
						const result = maybeVector.add(new Vector3(1, 1, 1));
					}
				}"
			`);
		},
	},
	{
		code: unindent`
			interface WithMetadata { readonly metadata: string; }
			function processVector(vec: Vector3 & WithMetadata) {
				// This should be detected as Vector3 math and flagged
				const scaled = vec * 2;
				return scaled;
			}
		`,
		errors: [{ messageId }],
		output: (output) => {
			expect(output.includes("vec.mul(2)")).toBe(true);
		},
	},
	{
		code: unindent`
			interface Container { position?: Vector3; }
			function testOptional(container: Container) {
				if (container.position) {
					const newPos = container.position + new Vector3(1, 0, 0);
				}
			}
		`,
		errors: [{ messageId }],
		output: (output) => {
			expect(output.includes("container.position.add(")).toBe(true);
		},
	},
	{
		code: unindent`
			function getVector(): Vector3 | undefined { return new Vector3(1, 2, 3); }
			function test() {
				const vec = getVector();
				if (vec) {
					const result = vec * 2;
				}
			}
		`,
		errors: [{ messageId }],
		output: (output) => {
			expect(output.includes("vec.mul(2)")).toBe(true);
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noObjectMath,
	valid,
});
