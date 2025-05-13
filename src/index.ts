import type { TSESLint } from "@typescript-eslint/utils";

import type { Linter } from "eslint";

import { version } from "../package.json";
import { luaTruthiness } from "./rules/lua-truthiness/rule";
import { misleadingLuaTupleChecks } from "./rules/misleading-lua-tuple-checks/rule";
import { noAny } from "./rules/no-any/rule";
import { noArrayPairs } from "./rules/no-array-pairs/rule";
import { noEnumMerging } from "./rules/no-enum-merging/rule";
import { noExportAssignableLet } from "./rules/no-export-assignment-let/rule";
import { noForIn } from "./rules/no-for-in/rule";
import { noFunctionExpressionName } from "./rules/no-function-expression-name/rule";
import { noGetSet } from "./rules/no-get-set/rule";
import { noInvalidIdentifier } from "./rules/no-invalid-identifier/rule";
import { noNamespaceMerging } from "./rules/no-namespace-merging/rule";
import { noNull } from "./rules/no-null/rule";
import { noObjectMath } from "./rules/no-object-math/rule";
import { noPostFixNew } from "./rules/no-post-fix-new/rule";
import { noPrecedingSpreadElement } from "./rules/no-preceding-spread-element/rule";
import { noPrivateIdentifier } from "./rules/no-private-identifier/rule";
import { noUnsupportedSyntax } from "./rules/no-unsupported-syntax/rule";
import { noValueTypeof } from "./rules/no-value-typeof/rule";
import { preferGetPlayers } from "./rules/prefer-get-players/rule";
import { preferTaskLibrary } from "./rules/prefer-task-library/rule";
import { sizeMethod } from "./rules/size-method/rule";

const PLUGIN_NAME = "roblox-ts-x";

const plugin = {
	meta: {
		name: PLUGIN_NAME,
		version,
	},
	rules: {
		"lua-truthiness": luaTruthiness,
		"misleading-lua-tuple-checks": misleadingLuaTupleChecks,
		"no-any": noAny,
		"no-array-pairs": noArrayPairs,
		"no-enum-merging": noEnumMerging,
		"no-export-assignment-let": noExportAssignableLet,
		"no-for-in": noForIn,
		"no-function-expression-name": noFunctionExpressionName,
		"no-get-set": noGetSet,
		"no-invalid-identifier": noInvalidIdentifier,
		"no-namespace-merging": noNamespaceMerging,
		"no-null": noNull,
		"no-object-math": noObjectMath,
		"no-post-fix-new": noPostFixNew,
		"no-preceding-spread-element": noPrecedingSpreadElement,
		"no-private-identifier": noPrivateIdentifier,
		"no-unsupported-syntax": noUnsupportedSyntax,
		"no-value-typeof": noValueTypeof,
		"prefer-get-players": preferGetPlayers,
		"prefer-task-library": preferTaskLibrary,
		"size-method": sizeMethod,
	},
} satisfies TSESLint.FlatConfig.Plugin;

export type RuleOptions = {
	[K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export default {
	...plugin,
	/**
	 * @ignore
	 * @deprecated - Use `configs` instead.
	 */
	config: {
		recommended: createConfig(),
	},
	configs: {
		recommended: createConfig(),
	},
};

export type Rules = {
	[K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};

type RuleDefinitions = (typeof plugin)["rules"];

function createConfig(): TSESLint.FlatConfig.Config {
	return {
		plugins: {
			[PLUGIN_NAME]: plugin,
		},
		rules: getRules(),
	};
}

function getRules(): Linter.RulesRecord {
	return Object.fromEntries(
		Object.keys(plugin.rules).map(ruleName => [`${PLUGIN_NAME}/${ruleName}`, "error"]),
	);
}
