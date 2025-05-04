import type { Linter } from "eslint";

import { version } from "../package.json";
import { luaTruthiness } from "./rules/lua-truthiness/rule";
import { misleadingLuaTupleChecks } from "./rules/misleading-lua-tuple-checks/rule";
import { noArrayPairs } from "./rules/no-array-pairs/rule";
import { noEnumMerging } from "./rules/no-enum-merging/rule";
import { noExportAssignableLet } from "./rules/no-export-assignment-let/rule";
import { noForIn } from "./rules/no-for-in/rule";
import { noFunctionExpressionName } from "./rules/no-function-expression-name/rule";
import { noGetSet } from "./rules/no-get-set/rule";
import { noInvalidIdentifier } from "./rules/no-invalid-identifier/rule";
import { noNamespaceMerging } from "./rules/no-namespace-merging/rule";
import { noNull } from "./rules/no-null/rule";
import { noPostFixNew } from "./rules/no-post-fix-new/rule";
import { noUnsupportedSyntax } from "./rules/no-unsupported-syntax/rule";
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
		"no-array-pairs": noArrayPairs,
		"no-enum-merging": noEnumMerging,
		"no-export-assignment-let": noExportAssignableLet,
		"no-for-in": noForIn,
		"no-function-expression-name": noFunctionExpressionName,
		"no-get-set": noGetSet,
		"no-invalid-identifier": noInvalidIdentifier,
		"no-namespace-merging": noNamespaceMerging,
		"no-null": noNull,
		"no-post-fix-new": noPostFixNew,
		"no-unsupported-syntax": noUnsupportedSyntax,
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
