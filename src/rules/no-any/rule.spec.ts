import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noAny, RULE_NAME } from "./rule";

const messageId = "any-violation";
const suggestId = "suggest-unknown";

const valid: Array<ValidTestCase> = [
	"const x: unknown = 1;",
	"let y: string = 'hello';",
	"function z(): number { return 1; }",
	"type MyType = { prop: boolean };",
	"interface MyInterface { method(): void; }",
	"const arr: Array<string> = [];",
	"const map: Map<string, number> = new Map();",
	"type Key = keyof any;",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const x: any = 1;",
		errors: [{ messageId }],
		output: "const x: unknown = 1;",
	},
	{
		code: "let y: any;",
		errors: [{ messageId }],
		output: "let y: unknown;",
	},
	{
		code: "function foo(param: any) {}",
		errors: [{ messageId }],
		output: "function foo(param: unknown) {}",
	},
	{
		code: "function bar(): any {}",
		errors: [{ messageId }],
		output: "function bar(): unknown {}",
	},
	{
		code: "type MyAny = any;",
		errors: [{ messageId }],
		output: "type MyAny = unknown;",
	},
	{
		code: "interface MyInterface { prop: any; }",
		errors: [{ messageId }],
		output: "interface MyInterface { prop: unknown; }",
	},
	{
		code: "interface MyInterface { method(p: any): void; }",
		errors: [{ messageId }],
		output: "interface MyInterface { method(p: unknown): void; }",
	},
	{
		code: "interface MyInterface { method(): any; }",
		errors: [{ messageId }],
		output: "interface MyInterface { method(): unknown; }",
	},
	{
		code: "class MyClass { prop: any; }",
		errors: [{ messageId }],
		output: "class MyClass { prop: unknown; }",
	},
	{
		code: "class MyClass { method(p: any) {} }",
		errors: [{ messageId }],
		output: "class MyClass { method(p: unknown) {} }",
	},
	{
		code: "class MyClass { method(): any {} }",
		errors: [{ messageId }],
		output: "class MyClass { method(): unknown {} }",
	},
	{
		code: "const arr: Array<any> = [];",
		errors: [{ messageId }],
		output: "const arr: Array<unknown> = [];",
	},
	{
		code: "const map: Map<string, any> = new Map();",
		errors: [{ messageId }],
		output: "const map: Map<string, unknown> = new Map();",
	},
	{
		code: "function generic<T = any>() {}",
		errors: [{ messageId }],
		output: "function generic<T = unknown>() {}",
	},
	{
		code: "const x = {} as any;",
		errors: [{ messageId }],
		output: "const x = {} as unknown;",
	},
	{
		code: "const x = <any>{};",
		errors: [{ messageId }],
		output: "const x = <unknown>{};",
	},
	{
		code: "const x: any = 1;",
		errors: errors => {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
			expect(errors[0]!.suggestions).toHaveLength(1);
			expect(errors[0]!.suggestions![0]!.messageId).toBe(suggestId);
		},
		options: [{ fixToUnknown: false }],
	},
	{
		code: "function foo(param: any) {}",
		errors: errors => {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
			expect(errors[0]!.suggestions).toHaveLength(1);
			expect(errors[0]!.suggestions![0]!.messageId).toBe(suggestId);
		},
		options: [{ fixToUnknown: false }],
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noAny,
	valid,
});
