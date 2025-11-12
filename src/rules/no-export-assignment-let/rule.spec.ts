import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";

import { run } from "../test";
import { noExportAssignableLet, RULE_NAME } from "./rule";

const messageId = "export-violation";

const valid: Array<ValidTestCase> = [
	"export const x = 1;",
	"export function foo() {}",
	"export class Bar {}",
	"export default function baz() {}",
	"export default class Qux {}",
	"export default 42;",
	"export = 42;",
	"const y = 2; export { y };",
	"let w = 4; export { w };",
	"function getCount() {}\nexport { getCount as getCounter }",
	"export let x = 1; export let y = 2;",
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "let y = 5; export = y;",
		errors: [{ messageId }],
	},
	{
		code: "let x = 1; x = 2; export = x;",
		errors: [{ messageId }],
	},
	{
		code: unindent`
			let value = 'initial';
			value = 'updated';
			export = value;
		`,
		errors: [{ messageId }],
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noExportAssignableLet,
	valid,
});
