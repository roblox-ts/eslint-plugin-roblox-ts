import type { Linter } from "eslint";

import { version } from "../package.json";
import { luaTruthiness } from "./rules/lua-truthiness/rule";
import { misleadingLuaTupleChecks } from "./rules/misleading-lua-tuple-checks/rule";
import { noInvalidIdentifier } from "./rules/no-invalid-identifier/rule";
import { noNull } from "./rules/no-null/rule";
import { noPostFixNew } from "./rules/no-post-fix-new/rule";
import { noValueTypeof } from "./rules/no-value-typeof/rule";
import { preferTaskLibrary } from "./rules/prefer-task-library/rule";
import { sizeMethod } from "./rules/size-method/rule";

const plugin = {
	meta: {
		name: "roblox-ts-x",
		version,
	},
	rules: {
		"lua-truthiness": luaTruthiness,
		"misleading-lua-tuple-checks": misleadingLuaTupleChecks,
		"no-invalid-identifier": noInvalidIdentifier,
		"no-null": noNull,
		"no-post-fix-new": noPostFixNew,
		"no-value-typeof": noValueTypeof,
		"prefer-task-library": preferTaskLibrary,
		"size-method": sizeMethod,
	},
};

export default plugin;

export type RuleOptions = {
	[K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export type Rules = {
	[K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};

type RuleDefinitions = (typeof plugin)["rules"];
