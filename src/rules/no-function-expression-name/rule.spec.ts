import { type InvalidTestCase, unindent, type ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noFunctionExpressionName, RULE_NAME } from "./rule";

const messageId = "function-expression-violation";

const valid: Array<ValidTestCase> = [
	"const x = function() {};",
	"const y = () => {};",
	"function foo() {}",
	"class A { method() {} }",
	"const obj = { method: function() {} };",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const x = function foo() {};",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"const x = function() {};"');
		},
	},
	{
		code: unindent`
            const obj = {
                method: function bar() {}
            };
        `,
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot(`
                "const obj = {
                    method: function() {}
                };"
            `);
		},
	},
	{
		code: "(function baz() {}())",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"(function() {}())"');
		},
	},
	{
		code: unindent`
            const maths = {
                factorial: function factorial(n: number): number {    
                    if (n <= 1) {
                        return 1;
                    }

                    return n * factorial(n - 1);
                }
            };
        `,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
			expect(errors[0]!.suggestions).toBeUndefined();
		},
	},
	{
		code: "doSomething(function cbName() {});",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"doSomething(function() {});"');
		},
	},
	{
		code: "const funcs = [function arrFunc() {}];",
		errors: [{ messageId }],
		output: output => {
			expect(output).toMatchInlineSnapshot('"const funcs = [function() {}];"');
		},
	},
	{
		code: unindent`
            const outer = function outerFunc() {
                const inner = function innerFunc() {};
            };
        `,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every(err => err.messageId === messageId)).toBe(true);
		},
		output: output => {
			expect(output).toMatchInlineSnapshot(`
                "const outer = function() {
                    const inner = function() {};
                };"
            `);
		},
	},
	{
		code: unindent`
            let fib = function fibonacci(n: number): number {
                return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
            };
        `,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
			expect(errors[0]!.suggestions).toBeUndefined();
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noFunctionExpressionName,
	valid,
});
