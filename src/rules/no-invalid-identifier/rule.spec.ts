import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noInvalidIdentifier, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"const x = 1;",
	"let y = 'hello';",
	"function z() {}",
	"class MyClass {}",
	"const Local = 5;",
	"const my_and = true;",
	"const isNil = false;",
	"interface MyInterface { local: string; }",
	"class MyClass { or() {} }",
	"enum MyEnum { nil }",
	"class Data { or?: boolean; }",
	"const obj = { and: true }; if (obj.and) { /* ... */ };",
	"type MyType = { config: { repeat: boolean } };",
	"type MyType = { config: { repeat: boolean } }; function check(p: MyType) { if (p.config.repeat) {} }",
	"return $tuple(binding, motion);",
	'import { $NODE_ENV } from "rbxts-transform-env"; print($NODE_ENV === "development");',
	"const { and: andFixed } = { and: 1 };",
	"const x = 5; export { x as local };",
	"const x = { local: 5, }; print(x.local);",
	"import { value as good } from './module';",
	"const Rectangle = class {};",
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
	"namespace local {}",
	"let local = 5; local = 10; local = 15; local = 20;",
	"const local = class {};",
].map((testCase) => {
	return {
		code: testCase.toString(),
		errors: [{ messageId: "invalid-identifier" }],
	};
});

const invalidCharacters: Array<InvalidTestCase> = ["let $path = 5;", "const π = 3.14159;"].map(
	(testCase) => {
		return {
			code: testCase.toString(),
			errors: [{ messageId: "invalid-characters" }],
		};
	},
);

const invalidReserved: Array<InvalidTestCase> = [
	"const next = true;",
	"const pairs = () => {};",
	"const setmetatable = {};",
	"Promise.try(() => {}).catch(error => { /* ... */ });",
].map((testCase) => {
	return {
		code: testCase.toString(),
		errors: [{ messageId: "reserved-identifier" }],
	};
});

run({
	name: RULE_NAME,
	invalid: [...invalidIdentifier, ...invalidCharacters, ...invalidReserved],
	rule: noInvalidIdentifier,
	valid,
});
