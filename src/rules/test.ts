import tsParser from "@typescript-eslint/parser";

import type { Linter } from "eslint";
import type { RuleTesterInitOptions, TestCasesOptions } from "eslint-vitest-rule-tester";
import { run as runInternal } from "eslint-vitest-rule-tester";
import path from "path";

export function run(options: RuleTesterInitOptions & TestCasesOptions): void {
	void runInternal({
		parser: tsParser as Linter.Parser,
		parserOptions: {
			ecmaVersion: 2018,
			project: path.resolve(__dirname, "../../fixtures/tsconfig.json"),
			tsconfigRootDir: path.resolve(__dirname, "../../fixtures"),
		},
		...options,
	});
}
