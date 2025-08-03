#!/usr/bin/env tsx

import tseslint from "@typescript-eslint/eslint-plugin";

import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface ConfigDefinition {
	configKey: string;
	name: string;
}

const CONFIG_DEFINITIONS: Array<ConfigDefinition> = [
	{ configKey: "recommended", name: "recommended" },
	{ configKey: "strict", name: "strict" },
	{ configKey: "stylistic", name: "stylistic" },
	{ configKey: "recommended-type-checked-only", name: "recommendedTypeChecked" },
	{ configKey: "strict-type-checked-only", name: "strictTypeChecked" },
	{ configKey: "stylistic-type-checked-only", name: "stylisticTypeChecked" },
];

/**
 * Extracts rules from all configured TypeScript ESLint configs.
 *
 * @returns Record mapping config names to their TypeScript ESLint rules.
 */
function extractAllConfigs(): Record<string, Array<string>> {
	const configs: Record<string, Array<string>> = {};

	for (const { configKey, name } of CONFIG_DEFINITIONS) {
		const config = tseslint.configs[configKey];
		const configRules = config?.rules ?? {};
		configs[name] = extractTypescriptEslintRules(configRules);
	}

	return configs;
}

/**
 * Extracts TypeScript ESLint rules from a config object.
 *
 * @param rules - The rules object from a TypeScript ESLint config.
 * @returns Array of TypeScript ESLint rule names.
 */
function extractTypescriptEslintRules(rules: Record<string, unknown>): Array<string> {
	return Object.keys(rules).filter((rule) => rule.startsWith("@typescript-eslint/"));
}

/**
 * Generates the complete file content.
 *
 * @param configs - Record mapping config names to their rule arrays.
 * @returns The complete file content as a string.
 */
function generateFileContent(configs: Record<string, Array<string>>): string {
	const header = `// Auto-generated file. Do not edit manually.
// Run 'nr generate:types' to regenerate.

`;

	const typeDefinitions = CONFIG_DEFINITIONS.map(({ name }) =>
		generateRuleType(name, configs[name] ?? []),
	).join("\n\n");

	return header + typeDefinitions + "\n";
}

/**
 * Generates a TypeScript type definition for a config.
 *
 * @param configName - The configuration identifier.
 * @param rules - Array of TypeScript ESLint rule names.
 * @returns The TypeScript type definition as a string.
 */
function generateRuleType(configName: string, rules: Array<string>): string {
	const ruleUnion = rules.map((rule) => `\t| "${rule}"`).join("\n");
	const typeName = `TS${configName.charAt(0).toUpperCase() + configName.slice(1)}Rules`;

	return `/**
 * Rule names from TypeScript ESLint ${configName} config.
 */
export type ${typeName} =
${ruleUnion};`;
}

/** Generates TypeScript types for TypeScript ESLint rule names. */
async function generateTypes(): Promise<void> {
	const configs = extractAllConfigs();
	const content = generateFileContent(configs);
	const outputPath = join(process.cwd(), "src", "types", "generated.ts");

	await writeAndFormatFile(content, outputPath);
}

/**
 * Writes the generated content to file and applies ESLint fixes.
 *
 * @param content - The file content to write.
 * @param outputPath - The path where the file should be written.
 */
async function writeAndFormatFile(content: string, outputPath: string): Promise<void> {
	writeFileSync(outputPath, content, "utf8");
	console.log(`✅ Generated TypeScript ESLint rule types: ${outputPath}`);

	// Run ESLint with --fix on the generated file
	const { execSync } = await import("node:child_process");
	try {
		execSync(`npx eslint "${outputPath}" --fix`, { stdio: "inherit" });
		console.log("✅ Applied ESLint fixes to generated types");
	} catch (err) {
		console.warn(`⚠️  ESLint fixes failed: ${err}`);
	}
}

await generateTypes();
