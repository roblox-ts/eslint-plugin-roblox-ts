import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noPostFixNew, RULE_NAME } from "./rule";

const valid: Array<ValidTestCase> = [
	"const c = new CFrame();",
	"const v = new Vector3(1,2,3);",

	unindent`
		const foo = { new: () => {} }
		const c = foo.new();
	`,

	"if (foo.new) {}",
	"const a = new Instance();",

	unindent`
		class Foo { static new() { return new Foo(); } }
		Foo.new();
	`,

	unindent`
		class Baz { new() { return 42; } }
		const b = new Baz();
		b.new();
	`,

	unindent`
		const obj = { new: () => 123 };
		obj.new();
	`,

	unindent`
		class Base { static new() { return new Base(); } }
		class Derived extends Base {}
		Derived.new();
	`,

	unindent`
		Bar['new']();
	`,

	unindent`
		class Qux { new() { return 1; } }
		const q = new Qux();
		q.new();
	`,
];

const invalid: Array<InvalidTestCase> = [
	{
		code: "const c = CFrame.new();",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const c = new CFrame();"');
		},
	},
	{
		code: "const v = Vector3.new(1,2,3);",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const v = new Vector3(1,2,3);"');
		},
	},
	{
		code: "const u = UDim2.new(0,0,1,0);",
		output: (output) => {
			expect(output).toMatchInlineSnapshot('"const u = new UDim2(0,0,1,0);"');
		},
	},
	{
		code: unindent`
			interface Vector2 {
				readonly _nominal_Vector2: unique symbol;
				readonly X: number;
				readonly Y: number;
			}

			interface Vector2Constructor {
				new (x?: number, y?: number): Vector2;
			}

			declare const Vector2: Vector2Constructor;
			
			const v = Vector2.new(1, 2);
		`,
		output: (output) => {
			expect(output).toMatchInlineSnapshot(`
				"interface Vector2 {
					readonly _nominal_Vector2: unique symbol;
					readonly X: number;
					readonly Y: number;
				}

				interface Vector2Constructor {
					new (x?: number, y?: number): Vector2;
				}

				declare const Vector2: Vector2Constructor;

				const v = new Vector2(1, 2);"
			`);
		},
	},
	{
		code: unindent`
			class Bar {}
			Bar.new();
		`,
		output: (output) => {
			expect(output).toMatchInlineSnapshot(
				unindent`
					"class Bar {}
					new Bar();"
				`,
			);
		},
	},
	{
		code: unindent`
			const obj = { new: 123 };
			obj.new();
		`,
		output: (output) => {
			expect(output).toMatchInlineSnapshot(
				unindent`
					"const obj = { new: 123 };
					new obj();"
				`,
			);
		},
	},
	{
		code: unindent`
			function getClass() { return class {}; }
			getClass().new();
		`,
		output: (output) => {
			expect(output).toMatchInlineSnapshot(
				unindent`
					"function getClass() { return class {}; }
					new (getClass())();"
				`,
			);
		},
	},
];

run({
	name: RULE_NAME,
	invalid,
	rule: noPostFixNew,
	valid,
});
