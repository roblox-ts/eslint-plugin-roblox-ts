import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noInvalidIdentifier, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"const x = 1;",
	"let y = 'hello';",
	"function z() {}",
	"class MyClass {}",
	"const my_and = true;",
	"const isNil = false;",
	"interface MyInterface { local: string; }",
	"class MyClass { or() {} }",
	"enum MyEnum { nil }",
	"class Data { or?: boolean; }",
	"const obj = { and: true }; if (obj.and) { /* ... */ };",
	"type MyType = { config: { repeat: boolean } };",
	"type MyType = { config: { repeat: boolean } }; function check(p: MyType) { if (p.config.repeat) {} }",
];

const invalidIdentifier: Array<InvalidTestCase> = [
	"const and = true;",
	"let elseif = false;",
	"function end() {}",
	"const local = {};",
	"let nil = null;",
	"const not = () => {};",
	"let or = 1;",
	"function repeat() {}",
	"const then = Promise.resolve();",
	"let until = DateTime.now();",
	"const { and } = { and: 1 };",
	"function process(local: string) { /* ... */ }",
	"const myFunc = (and: boolean) => { /* ... */ };",
	"namespace repeat { export const x = 1; }",
	"import { value as local } from './module';",
	"const [local] = [1, 2];",
	"class end {}",
	"enum elseif { A, B }",
	"try { /* ... */ } catch (local) { /* ... */ }",
	"Promise.try(() => {}).catch(error => { /* ... */ });",
].map(testCase => {
	return {
		code: testCase.toString(),
		errors: [{ messageId: "invalid-identifier" }],
	};
});

const invalidCharacters: Array<InvalidTestCase> = ["let $path = 5;", "const π = 3.14159;"].map(
	testCase => {
		return {
			code: testCase.toString(),
			errors: [{ messageId: "invalid-characters" }],
		};
	},
);

run({
	invalid: [...invalidIdentifier, ...invalidCharacters],
	name: RULE_NAME,
	rule: noInvalidIdentifier,
	valid,
});
