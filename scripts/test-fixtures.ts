#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { join } from "node:path";
import process from "node:process";

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

interface TestResult {
	details?: string;
	duration?: number;
	name: string;
	passed: boolean;
}

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

const testResults: Array<TestResult> = [];

/**
 * Handle ESLint execution error for fixtures.
 *
 * @param err - The error from ESLint execution.
 * @param fixtureName - Name of the fixture being tested.
 * @returns True if error handling succeeded, false otherwise.
 */
function handleFixtureError(err: unknown, fixtureName: string): boolean {
	const stdout = (err as { stdout?: string }).stdout ?? "";

	if (stdout.trim() === "") {
		testResults.push({
			details: "No ESLint output received",
			name: `${fixtureName} fixture`,
			passed: false,
		});
		return false;
	}

	try {
		const results = JSON.parse(stdout) as Array<ESLintResult>;
		return validateResults(results, fixtureName);
	} catch (err_) {
		const errorMessage = err_ instanceof Error ? err_.message : String(err_);
		testResults.push({
			details: `Failed to parse ESLint output: ${errorMessage}`,
			name: `${fixtureName} fixture`,
			passed: false,
		});
		return false;
	}
}

/** Main test function that runs all fixture tests. */
function main(): never {
	const startTime = Date.now();

	const fixtures: Array<FixtureTest> = [
		{ name: "eslint-plugin-roblox-ts-fixture-v8", version: "v8" },
		{ name: "eslint-plugin-roblox-ts-fixture-v9", version: "v9" },
	];

	let allPassed = true;

	for (const { name, version } of fixtures) {
		const fixturesPassed = testFixture(name, version);
		const constraintPassed = testFileConstraint(name, version);

		if (!fixturesPassed || !constraintPassed) {
			allPassed = false;
		}
	}

	const duration = Date.now() - startTime;
	printTestSummary(allPassed, duration);

	process.exit(allPassed ? 0 : 1);
}

/**
 * Display a formatted summary of test results including pass/fail status,
 * individual test outcomes, and execution time.
 *
 * @param allPassed - Whether all tests passed.
 * @param duration - Test duration in milliseconds.
 */
function printTestSummary(allPassed: boolean, duration: number): void {
	const status = allPassed ? "PASS" : "FAIL";
	console.log(`${status}  fixture tests`);
	console.log("");

	for (const result of testResults) {
		const symbol = result.passed ? "✓" : "✗";
		const details = result.details !== undefined ? ` (${result.details})` : "";
		console.log(`${symbol} ${result.name}${details}`);
	}

	console.log("");

	const passed = testResults.filter((result) => result.passed).length;
	const total = testResults.length;
	const failed = total - passed;

	if (allPassed) {
		console.log(`Tests: ${passed} passed, ${total} total`);
	} else {
		console.log(`Tests: ${failed} failed, ${passed} passed, ${total} total`);
	}

	console.log(`Time:  ${(duration / 1000).toFixed(1)}s`);
}

/**
 * Record a constraint test failure.
 *
 * @param robloxTsMessages - Array of roblox-ts rule violation messages.
 * @param fixtureName - Name of the fixture being tested.
 */
function recordConstraintFailure(
	robloxTsMessages: Array<ESLintMessage>,
	fixtureName: string,
): void {
	const triggeredRules = robloxTsMessages
		.map((message) => message.ruleId)
		.filter((ruleId): ruleId is string => ruleId !== undefined);
	const details = `Root-level file triggered ${robloxTsMessages.length} roblox-ts rules: ${triggeredRules.join(", ")}`;
	testResults.push({
		details,
		name: `${fixtureName} file constraints`,
		passed: false,
	});
}

/**
 * Record a constraint test success.
 *
 * @param fixtureName - Name of the fixture being tested.
 */
function recordConstraintSuccess(fixtureName: string): void {
	testResults.push({
		name: `${fixtureName} file constraints`,
		passed: true,
	});
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
 * Run ESLint on root-level config file to test file constraint.
 *
 * @param eslintVersion - ESLint version being tested (v8 or v9).
 * @returns ESLint JSON output as string.
 */
function runESLintOnRootFile(eslintVersion: string): string {
	const fixtureDirectory = join("fixtures", eslintVersion === "v8" ? "eslint-v8" : "eslint-v9");

	return execSync(`cd ${fixtureDirectory} && npx eslint config-test.ts --format json`, {
		encoding: "utf8",
		stdio: "pipe",
	});
}

/**
 * Test file constraint - verify root-level files don't trigger roblox-ts rules.
 *
 * @param fixtureName - Name of the fixture package to test.
 * @param eslintVersion - ESLint version being tested (v8 or v9).
 * @returns True if constraint test passed, false otherwise.
 */
function testFileConstraint(fixtureName: string, eslintVersion: string): boolean {
	try {
		const stdout = runESLintOnRootFile(eslintVersion);
		return validateConstraintResults(stdout, fixtureName);
	} catch (err) {
		const stdout = (err as { stdout?: string }).stdout ?? "";
		return validateConstraintResults(stdout, fixtureName);
	}
}

/**
 * Test a specific fixture.
 *
 * @param fixtureName - Name of the fixture package to test.
 * @param eslintVersion - ESLint version being tested (v8 or v9).
 * @returns True if test passed, false otherwise.
 */
function testFixture(fixtureName: string, eslintVersion: string): boolean {
	try {
		runESLintOnFixture(eslintVersion);
		// If ESLint succeeds (no errors), that's unexpected for our test fixtures
		testResults.push({
			details: "Expected violations but none were found",
			name: `${fixtureName} fixture`,
			passed: false,
		});
		return false;
	} catch (err) {
		// ESLint failed (found errors) - this is expected!
		return handleFixtureError(err, fixtureName);
	}
}

/**
 * Validate constraint test results to ensure no roblox-ts rules were triggered.
 *
 * @param stdout - ESLint output to validate.
 * @param fixtureName - Name of the fixture being tested.
 * @returns True if constraint validation passed, false otherwise.
 */
function validateConstraintResults(stdout: string, fixtureName: string): boolean {
	if (stdout.trim() === "") {
		testResults.push({
			details: "No ESLint output received",
			name: `${fixtureName} file constraints`,
			passed: false,
		});
		return false;
	}

	try {
		const results = JSON.parse(stdout) as Array<ESLintResult>;
		const { robloxTsMessages } = analyzeESLintResults(results);

		if (robloxTsMessages.length > 0) {
			recordConstraintFailure(robloxTsMessages, fixtureName);
			return false;
		}

		recordConstraintSuccess(fixtureName);
		return true;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		testResults.push({
			details: `Failed to parse ESLint output: ${errorMessage}`,
			name: `${fixtureName} file constraints`,
			passed: false,
		});
		return false;
	}
}

/**
 * Validate ESLint results contain expected violations.
 *
 * @param results - ESLint results array.
 * @param fixtureName - Name of the fixture being tested.
 * @returns True if validation passed, false otherwise.
 */
function validateResults(results: Array<ESLintResult>, fixtureName: string): boolean {
	const { robloxTsMessages } = analyzeESLintResults(results);

	if (robloxTsMessages.length === 0) {
		testResults.push({
			details: "No roblox-ts rule violations found",
			name: `${fixtureName} fixture`,
			passed: false,
		});
		return false;
	}

	// Success if we found roblox-ts violations
	const details = `${robloxTsMessages.length} roblox-ts violations found`;
	testResults.push({
		details,
		name: `${fixtureName} fixture`,
		passed: true,
	});

	return true;
}

main();
