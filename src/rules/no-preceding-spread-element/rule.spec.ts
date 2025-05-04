import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noPrecedingSpreadElement, RULE_NAME } from "./rule";

// Note: Message ID changed in the rule implementation
const messageId = "preceding-rest-violation";

const valid: Array<ValidTestCase> = [
	"function foo(...args) {}",
	"function bar(a, ...args) {}",
	"const baz = (...args) => {}",
	"const qux = (a, b, ...args) => {}",
	"const quux = function(...args) {}",
	"const corse = function(a, ...args) {}",
	"const arr = [...otherArr, 1];",
	"const arr2 = [1, ...otherArr, 2];",
	"const arr3 = [1, 2, ...otherArr];",
	"const obj = { ...a, b: 1 };",
	"const obj2 = { a: 1, ...b };",
	"const obj3 = { a: 1, ...b, c: 2 };",
	"print(...args);",
	"print(1, ...args);",
	"fn(a, b, ...c);",
	"new Cls(...args);",
	"new Cls(1, ...args);",
	"new Cls(a, b, ...c);",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "print(1, ...[2, 3], 4);",
		errors: [{ messageId }],
	},
	{
		code: "fn(...args, 1);",
		errors: [{ messageId }],
	},
	{
		code: "new Cls(...args, 1);",
		errors: [{ messageId }],
	},
	{
		code: "math.max(...numbers, 0);",
		errors: [{ messageId }],
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noPrecedingSpreadElement,
	valid,
});
