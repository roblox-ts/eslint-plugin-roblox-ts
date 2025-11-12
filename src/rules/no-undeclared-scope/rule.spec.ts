import { unindent } from "@antfu/utils";

import type { InvalidTestCase, ValidTestCase } from "eslint-vitest-rule-tester";
import { expect } from "vitest";

import { run } from "../test";
import { noUndeclaredScope, RULE_NAME } from "./rule";

const UNDECLARED_SCOPE = "undeclaredScope";

const valid: Array<ValidTestCase> = [
	// Imports from @rbxts scope (allowed by fixtures/tsconfig.json)
	'import { Players } from "@rbxts/services";',
	'import type { Component } from "@rbxts/react";',

	// Non-scoped packages
	'import lodash from "lodash";',
	'import * as React from "react";',

	// Relative imports
	'import { myFunction } from "./utils";',
	'import { Component } from "../components/Component";',
	'import config from "../../config.json";',

	// Built-in modules
	'import path from "path";',

	// Export from allowed scope
	'export { Players } from "@rbxts/services";',
	'export * from "@rbxts/types";',

	// Dynamic import from allowed scope
	'const services = await import("@rbxts/services");',
	'import("@rbxts/react").then(module => {});',

	// Mixed imports where @rbxts is allowed
	unindent`
		import { Players } from "@rbxts/services";
		import { myUtil } from "./utils";
		import lodash from "lodash";
	`,
];

const invalid: Array<InvalidTestCase> = [
	// Single undefined scope - @flamework
	{
		code: 'import { Flamework } from "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Single undefined scope - @halcyon
	{
		code: 'import { bootstrapClient } from "@halcyon/bootstrap";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Multiple undefined scopes in same file
	{
		code: unindent`
			import { Flamework } from "@flamework/core";
			import { bootstrapClient } from "@halcyon/bootstrap";
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
			expect(errors[1]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Type-only import from undefined scope
	{
		code: 'import type { Config } from "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Named import from undefined scope
	{
		code: 'import { Component, Service } from "@flamework/components";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Default import from undefined scope
	{
		code: 'import Flamework from "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Namespace import from undefined scope
	{
		code: 'import * as Flamework from "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Export from undefined scope
	{
		code: 'export { Flamework } from "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Export all from undefined scope
	{
		code: 'export * from "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Dynamic import from undefined scope
	{
		code: 'const flamework = await import("@flamework/core");',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Dynamic import with then
	{
		code: 'import("@flamework/core").then(module => {});',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Mixed valid and invalid imports (only flag invalid)
	{
		code: unindent`
			import { Players } from "@rbxts/services";
			import { Flamework } from "@flamework/core";
			import lodash from "lodash";
		`,
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Multiple imports from same undefined scope
	{
		code: unindent`
			import { Flamework } from "@flamework/core";
			import { Component } from "@flamework/components";
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
			expect(errors[1]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Side-effect import from undefined scope
	{
		code: 'import "@flamework/core";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Common undefined scopes - @types
	{
		code: 'import type { Config } from "@types/node";',
		errors(errors) {
			expect(errors).toHaveLength(1);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},

	// Real-world example from user's code
	{
		code: unindent`
			import { Flamework } from "@flamework/core";
			import { bootstrapClient } from "@halcyon/bootstrap";

			bootstrapClient(Flamework);
		`,
		errors(errors) {
			expect(errors).toHaveLength(2);
			expect(errors[0]!.messageId).toBe(UNDECLARED_SCOPE);
			expect(errors[1]!.messageId).toBe(UNDECLARED_SCOPE);
		},
	},
];

run({
	invalid,
	name: RULE_NAME,
	rule: noUndeclaredScope,
	valid,
});
