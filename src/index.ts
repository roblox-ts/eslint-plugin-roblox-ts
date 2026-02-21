import type { Linter } from "eslint";

import { configs } from "./configs";
import { parser } from "./configs/recommended";
import { plugin } from "./plugin";

// Default export for ESLint v9+ (flat config)
export default {
	...plugin,
	configs,
	parser,
};

// Named exports for ESLint v8 (legacy config)
export const { rules } = plugin;

export type RuleOptions = {
	[K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export type Rules = {
	[K in keyof RuleOptions]: Linter.RuleEntry<Extract<RuleOptions[K], Array<unknown>>>;
};

type RuleDefinitions = typeof plugin.rules;

export { configs } from "./configs";
export { legacyParserConfig } from "./configs/recommended";
export { TYPESCRIPT_FILES } from "./util";
