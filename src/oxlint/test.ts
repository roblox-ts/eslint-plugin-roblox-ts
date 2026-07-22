import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const FIXTURE_FILENAME = "fixture.ts";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const isWindows = process.platform === "win32";
/** Oxlint loads the package's default entry point as a `jsPlugin`. */
const builtPluginPath = path.resolve(rootDirectory, "dist", "index.mjs");
// oxlint's bin is a Node ESM shim; run it via `node` (no shell) for portability.
const oxlintBin = path.resolve(rootDirectory, "node_modules", "oxlint", "bin", "oxlint");

/** A single oxlint diagnostic, reduced to the fields the tests assert on. */
export interface OxlintDiagnostic {
	/** Rule code, e.g. `roblox-ts(no-any)`. */
	readonly code: string;
	/** Rendered message with `{{data}}` placeholders interpolated. */
	readonly message: string;
}

/** Options for a single oxlint run. */
export interface RunOxlintOptions {
	/** Source code to lint. */
	readonly code: string;
	/** File name (drives the parser: use `.tsx` for JSX). */
	readonly filename?: string;
	/** Rule options, appended to `"error"` as `["error", ...options]`. */
	readonly options?: ReadonlyArray<unknown>;
	/** The rule key without the plugin prefix, e.g. `no-any`. */
	readonly rule: string;
}

/** The result of linting a fixture with a single plugin rule under oxlint. */
export interface RunOxlintResult {
	/** Diagnostics reported by the rule. */
	readonly diagnostics: Array<OxlintDiagnostic>;
	/** File contents after `oxlint --fix`. */
	readonly fixed: string;
}

/**
 * Ensures the plugin entry has been built. The oxlint suite exercises the
 * shipped `dist/index.mjs` (loaded by oxlint's `jsPlugins`), so a build is
 * required; build once if it is missing.
 */
export function ensureOxlintPluginBuilt(): void {
	if (existsSync(builtPluginPath)) {
		return;
	}

	execFileSync("pnpm", ["build"], { cwd: rootDirectory, shell: isWindows, stdio: "inherit" });
}

/**
 * Lints (and separately fixes) a fixture with one plugin rule using the real
 * oxlint binary and the built `dist/index.mjs` plugin.
 *
 * @param options - The rule, fixture, and rule options to run.
 * @returns The reported diagnostics and the `--fix` output.
 */
export function runOxlint({
	code,
	filename = FIXTURE_FILENAME,
	options,
	rule,
}: RunOxlintOptions): RunOxlintResult {
	ensureOxlintPluginBuilt();

	const directory = mkdtempSync(path.join(tmpdir(), "roblox-ts-oxlint-"));
	try {
		const entry = options === undefined ? "error" : ["error", ...options];
		const configPath = writeConfig(directory, { [`roblox-ts/${rule}`]: entry });
		const filePath = path.join(directory, filename);
		writeFileSync(filePath, code);

		const stdout = invokeOxlint(["--config", configPath, "-f", "json", filePath], directory);
		const diagnostics = parseDiagnostics(stdout);

		invokeOxlint(["--config", configPath, "--fix", filePath], directory);
		const fixed = readFileSync(filePath, "utf8");

		return { diagnostics, fixed };
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
}

/**
 * Lints two sibling directories with different options for the same rule in a
 * _single_ oxlint invocation, and returns each file's `--fix` output.
 *
 * `createOnce` runs once per run while options vary per file, so any state a
 * rule (or this bridge) caches across files shows up here as one directory
 * getting the other's options. A single-file run cannot catch that.
 *
 * @param rule - The rule key to enable, without the plugin prefix.
 * @param code - The fixture written into both directories.
 * @param optionsPerDirectory - Rule options keyed by directory name.
 * @returns The post-fix contents of each directory's fixture.
 */
export function runOxlintPerDirectoryOptions(
	rule: string,
	code: string,
	optionsPerDirectory: Record<string, ReadonlyArray<unknown>>,
): Record<string, string> {
	ensureOxlintPluginBuilt();

	const root = mkdtempSync(path.join(tmpdir(), "roblox-ts-oxlint-multi-"));
	try {
		for (const [directory, options] of Object.entries(optionsPerDirectory)) {
			const subdirectory = path.join(root, directory);
			mkdirSync(subdirectory);
			writeConfig(subdirectory, { [`roblox-ts/${rule}`]: ["error", ...options] });
			writeFileSync(path.join(subdirectory, FIXTURE_FILENAME), code);
		}

		// No `--config`: oxlint discovers each directory's own `.oxlintrc.json`.
		invokeOxlint(["--fix", "."], root);

		return Object.fromEntries(
			Object.keys(optionsPerDirectory).map((directory) => [
				directory,
				readFileSync(path.join(root, directory, FIXTURE_FILENAME), "utf8"),
			]),
		);
	} finally {
		rmSync(root, { force: true, recursive: true });
	}
}

/**
 * Runs oxlint over an empty fixture with a single rule enabled and returns its
 * combined output.
 *
 * Because oxlint calls `createOnce` eagerly for _every_ rule in the plugin at
 * registration time, this exercises plugin load: any rule whose `createOnce`
 * body touches forbidden context fails here regardless of which rule is
 * enabled. RuleTester cannot catch that failure mode.
 *
 * @param rule - The rule key to enable, without the plugin prefix.
 * @returns Oxlint's stdout and stderr, concatenated.
 */
export function runOxlintRegistration(rule: string): string {
	ensureOxlintPluginBuilt();

	const directory = mkdtempSync(path.join(tmpdir(), "roblox-ts-oxlint-reg-"));
	try {
		const configPath = writeConfig(directory, { [`roblox-ts/${rule}`]: "error" });
		const filePath = path.join(directory, "empty.ts");
		writeFileSync(filePath, "export {};\n");

		return invokeOxlint(["--config", configPath, filePath], directory);
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
}

function invokeOxlint(args: Array<string>, cwd: string): string {
	try {
		return execFileSync(process.execPath, [oxlintBin, ...args], { cwd, encoding: "utf8" });
	} catch (err) {
		// oxlint exits non-zero when diagnostics are found; stdout still holds
		// them.
		const { stderr, stdout } = err as { stderr?: string; stdout?: string };
		if (typeof stdout === "string") {
			return stdout + (stderr ?? "");
		}

		throw err;
	}
}

/**
 * Extracts this plugin's diagnostics from oxlint's JSON report.
 *
 * A run that fails inside a plugin emits an entry with no `code`, so the shape
 * is narrowed rather than assumed.
 *
 * @param stdout - Oxlint's `-f json` output.
 * @returns The diagnostics belonging to this plugin.
 */
function parseDiagnostics(stdout: string): Array<OxlintDiagnostic> {
	const parsed = JSON.parse(stdout) as {
		diagnostics?: Array<{ code?: string; message: string }>;
	};

	return (parsed.diagnostics ?? []).flatMap(({ code, message }) => {
		return code?.startsWith("roblox-ts(") === true ? [{ code, message }] : [];
	});
}

function writeConfig(directory: string, rules: Record<string, unknown>): string {
	const configPath = path.join(directory, ".oxlintrc.json");
	writeFileSync(
		configPath,
		JSON.stringify({
			// oxlint's own `correctness` rules are on by default; disable them
			// so diagnostics and `--fix` output reflect only the plugin rule
			// under test. `no-unused-labels`, for instance, has a fix that
			// otherwise competes with `no-implicit-self`.
			categories: { correctness: "off" },
			jsPlugins: [builtPluginPath],
			plugins: [],
			rules,
		}),
	);
	return configPath;
}
