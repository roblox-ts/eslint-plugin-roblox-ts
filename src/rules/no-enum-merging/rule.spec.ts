import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { unindent } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noEnumMerging, RULE_NAME } from "./rule";

const messageId = "enum-merging-violation";

const valid: Array<ValidTestCase> = [
	"enum Color { Red, Green, Blue }",
	"enum Status { Pending } enum Result { Success }",
	unindent`
		function foo() {
			enum Action { Run }
		}
		enum Action { Jump }
	`,
	unindent`
		namespace A {
			enum State { On }
		}
		namespace B {
			enum State { Off }
		}
	`,
	unindent`
		enum Outer { A }
		function bar() {
			enum Inner { B }
		}
	`,
];

const invalid: Array<InvalidTestCase> = [
	{
		code: unindent`
			enum Color { Red }
			enum Color { Green }
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			enum Status { Pending }
			enum Result { Success }
			enum Status { Complete }
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			function foo() {
				enum Action { Run }
				enum Action { Walk }
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			namespace MyNamespace {
				enum Direction { Up }
				enum Direction { Down }
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			enum Fruit { Apple }
			enum Fruit { Banana }
			enum Fruit { Orange }
		`,
		errors(errors) {
			expect(errors).toHaveLength(3);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noEnumMerging,
	valid,
});
