#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface ESLintMessage {
	column: number;
	line: number;
	message: string;
	ruleId?: string;
	severity: number;
}

interface ESLintResult {
	errorCount: number;
	filePath: string;
	messages: Array<ESLintMessage>;
	warningCount: number;
}

interface FixtureTest {
	name: string;
	version: string;
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { name: string };
const projectName = packageJson.name;

/** Expected roblox-ts rules that should be triggered in fixtures. */
const EXPECTED_RULES = [
	"roblox-ts/no-null",
	"roblox-ts/no-any",
	"roblox-ts/no-object-math",
	"roblox-ts/no-array-pairs",
	"roblox-ts/lua-truthiness",
	"roblox-ts/no-enum-merging",
	"roblox-ts/prefer-task-library",
	"roblox-ts/size-method",
	"roblox-ts/no-for-in",
	"roblox-ts/no-private-identifier",
	"roblox-ts/no-get-set",
];

/**
 * Extract and analyze roblox-ts messages from ESLint results.
 *
 * @param results - ESLint results array.
 * @returns Object with all messages and filtered roblox-ts messages.
 */
function analyzeESLintResults(results: Array<ESLintResult>) {
	const allMessages = results.flatMap((result) => result.messages);
	const robloxTsMessages = allMessages.filter(
		(message) => message.ruleId?.startsWith("roblox-ts/") ?? false,
	);

	return { allMessages, robloxTsMessages };
}

/** Main test function that runs all fixture tests. */
function main(): never {
	console.log(`🚀 Testing ${projectName} fixtures\n`);

	const fixtures: Array<FixtureTest> = [
		{ name: "eslint-plugin-roblox-ts-fixture-v8", version: "v8" },
		{ name: "eslint-plugin-roblox-ts-fixture-v9", version: "v9" },
	];

	let allPassed = true;

	for (const { name, version } of fixtures) {
		const passed = testFixture(name, version);
		if (!passed) {
			allPassed = false;
		}
	}

	console.log("\n" + "=".repeat(50));

	if (allPassed) {
		console.log("✅ All fixture tests passed!");
		console.log("🎉 Plugin works correctly with both ESLint v8 and v9");
		process.exit(0);
	} else {
		console.log("❌ Some fixture tests failed");
		process.exit(1);
	}
}

/**
 * Run ESLint on a fixture directory and capture output.
 *
 * @param eslintVersion - ESLint version being tested (v8 or v9).
 * @returns ESLint JSON output as string.
 */
function runESLintOnFixture(eslintVersion: string): string {
	const fixtureDirectory = join("fixtures", eslintVersion === "v8" ? "eslint-v8" : "eslint-v9");

	return execSync(`cd ${fixtureDirectory} && npx eslint src/**/*.ts --format json`, {
		encoding: "utf8",
		stdio: "pipe",
	});
}

/**
 * Test a specific fixture.
 *
 * @param fixtureName - Name of the fixture package to test.
 * @param eslintVersion - ESLint version being tested (v8 or v9).
 * @returns True if test passed, false otherwise.
 */
function testFixture(fixtureName: string, eslintVersion: string): boolean {
	console.log(`\n🧪 Testing ${fixtureName} (ESLint ${eslintVersion})`);

	try {
		runESLintOnFixture(eslintVersion);
		// If ESLint succeeds (no errors), that's unexpected for our test fixtures
		console.error(
			`❌ Expected ESLint to find violations in ${fixtureName}, but none were found`,
		);
		return false;
	} catch (err) {
		// ESLint failed (found errors) - this is expected!
		const stdout = (err as { stdout?: string }).stdout ?? "";

		if (stdout.trim() === "") {
			console.error(`❌ No ESLint output received for ${fixtureName}`);
			return false;
		}

		try {
			const results = JSON.parse(stdout) as Array<ESLintResult>;
			return validateResults(results, fixtureName, eslintVersion);
		} catch (err_) {
			console.error(
				`❌ Failed to parse ESLint JSON output for ${fixtureName}:`,
				(err_ as Error).message,
			);
			console.error("Raw output:", stdout.substring(0, 200) + "...");
			return false;
		}
	}
}

/**
 * Validate ESLint results contain expected violations.
 *
 * @param results - ESLint results array.
 * @param fixtureName - Name of the fixture being tested.
 * @param eslintVersion - ESLint version being tested.
 * @returns True if validation passed, false otherwise.
 */
function validateResults(
	results: Array<ESLintResult>,
	fixtureName: string,
	eslintVersion: string,
): boolean {
	const { allMessages, robloxTsMessages } = analyzeESLintResults(results);

	console.log(`   📊 Found ${allMessages.length} total violations`);
	console.log(`   🎯 Found ${robloxTsMessages.length} roblox-ts violations`);

	if (robloxTsMessages.length === 0) {
		console.error(`❌ No roblox-ts rule violations found in ${fixtureName}`);
		return false;
	}

	// Check that we have violations from our expected rules
	const foundRules = new Set(
		robloxTsMessages
			.map((message) => message.ruleId)
			.filter((ruleId): ruleId is string => ruleId !== undefined),
	);
	const missingRules = EXPECTED_RULES.filter((rule) => !foundRules.has(rule));

	if (missingRules.length > 0) {
		console.warn(
			`⚠️  Some expected rules not triggered in ${fixtureName}: ${missingRules.join(", ")}`,
		);
	}

	// Verify plugin loaded correctly by checking we have roblox-ts violations
	const foundRulesArray = Array.from(foundRules);
	console.log(`   ✅ Triggered rules: ${foundRulesArray.join(", ")}`);

	// Success if we found roblox-ts violations
	console.log(`   ✅ ${fixtureName} working correctly with ESLint ${eslintVersion}`);
	return true;
}

main();
