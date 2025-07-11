import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { unindent } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noNamespaceMerging, RULE_NAME } from "./rule";

const messageId = "namespace-merging-violation";

const valid: Array<ValidTestCase> = [
	"namespace A { export const x = 1; }",
	"namespace A { export const x = 1; } namespace B { export const y = 2; }",
	"module A { export const x = 1; }",
	"declare namespace A { export const x: number; }",
	unindent`
		module foo {
			namespace Inner { export const a = 1; }
		}
		namespace Inner { export const b = 2; }
	`,
	unindent`
		namespace Outer {
			namespace Inner { export const x = 1; }
		}
		namespace Another {
			namespace Inner { export const y = 2; }
		}
	`,
	unindent`
		namespace FooBar {
			export type Foo = "Bar";
		}

		namespace FooBar {
			export type Bar = "Foo";
		}
	`,
	unindent`
		namespace TypeOnly {
			export interface UserData {
				id: number;
				name: string;
			}
		}

		namespace TypeOnly {
			export type Status = "active" | "inactive";
		}
	`,
	unindent`
		namespace Mixed {
			type Internal = string;
		}

		namespace Mixed {
			interface Config {
				value: boolean;
			}
		}
	`,
	unindent`
		namespace Nested {
			export type Outer = {
				inner: Inner;
			};
		}

		namespace Nested {
			export interface Inner {
				value: number;
			}
		}
	`,
	unindent`
		namespace Empty {
		}

		namespace Empty {
			export type Something = unknown;
		}
	`,
];

const invalid: Array<InvalidTestCase> = [
	{
		code: unindent`
			namespace Merged {
				export const a = 1;
			}
			namespace Merged {
				export const b = 2;
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			module Merged {
				export const a = 1;
			}
			namespace Merged {
				export const b = 2;
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			declare namespace Merged {
				export const a: number;
			}
			declare namespace Merged {
				export const b: string;
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			namespace foo {
				namespace Inner {
					export const x = 1;
				}
				namespace Inner {
					export const y = 2;
				}
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			namespace Triple {
				export const a = 1;
			}
			namespace Triple {
				export const b = 2;
			}
			namespace Triple {
				export const c = 3;
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(3);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: "class A {} namespace A { export const x = 1; }",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
		},
	},
	{
		code: "function A() {} namespace A { export const x = 1; } ",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
		},
	},
	{
		code: "enum A { Val }; namespace A { export const x = 1; }",
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(messageId);
		},
	},
	{
		code: unindent`
			namespace MixedBad {
				export type TypeMember = string;
			}
			namespace MixedBad {
				export const valueMember = 42;
			}
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors.every((err) => err.messageId === messageId)).toBe(true);
		},
	},
	{
		code: unindent`
			namespace TypeFirst {
				export interface Config {
					name: string;
				}
			}
			namespace TypeFirst {
				export type Status = "ok";
			}
			namespace TypeFirst {
				export const defaultValue = "test";
			}
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
	rule: noNamespaceMerging,
	valid,
});
