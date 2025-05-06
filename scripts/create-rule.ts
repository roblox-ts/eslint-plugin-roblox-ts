import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const filePath = fileURLToPath(import.meta.url);
const directoryName = dirname(filePath);

const ruleName = process.argv[2];

if (ruleName === undefined) {
	console.error("Please provide a rule name (e.g., my-new-rule).");
	process.exit(1);
}

if (!/^[a-z]+(?:-[a-z]+)*$/.test(ruleName)) {
	console.error("Rule name must be in kebab-case (e.g., my-new-rule).");
	process.exit(1);
}

const ruleNameCamelCase = ruleName.replace(/-([a-z])/g, name => name[1]?.toUpperCase() ?? "ERROR");
const ruleDescription = ruleName
	.split("-")
	.map(word => word.charAt(0).toUpperCase() + word.slice(1))
	.join(" ");

const rootDirectory = resolve(directoryName, "..");
const rulesDirectory = join(rootDirectory, "src", "rules");
const templateDirectory = join(rootDirectory, "scripts", "template");
const ruleDirectoryPath = join(rulesDirectory, ruleName);
const indexPath = join(rootDirectory, "src", "index.ts");

// --- Create Rule Directory ---
if (existsSync(ruleDirectoryPath)) {
	console.error(`Rule directory already exists: ${ruleDirectoryPath}`);
	process.exit(1);
}

mkdirSync(ruleDirectoryPath);
console.log(`Created directory: ${ruleDirectoryPath}`);

// --- Copy and Process Template Files ---
const templateFiles = ["rule.ts.template", "rule.spec.ts.template", "documentation.md"];

for (const templateFileName of templateFiles) {
	const templateFilePath = join(templateDirectory, templateFileName);
	// Remove .template extension for the final file name
	const resolvedFileName = templateFileName.replace(/\.template$/, "");
	const resolvedFilePath = join(ruleDirectoryPath, resolvedFileName);

	let content = readFileSync(templateFilePath, "utf-8");
	content = content.replace(/\{\{RULE_NAME\}\}/g, ruleName);
	content = content.replace(/\{\{RULE_NAME_CAMEL_CASE\}\}/g, ruleNameCamelCase);
	content = content.replace(/\{\{RULE_DESCRIPTION\}\}/g, ruleDescription);

	writeFileSync(resolvedFilePath, content);
	console.log(`Created file: ${resolvedFilePath}`);
}

// --- Update src/index.ts ---
try {
	let indexContent = readFileSync(indexPath, "utf-8");

	// Add import statement
	const importStatement = `import { ${ruleNameCamelCase} } from "./rules/${ruleName}/rule";\n`;
	// Find the last import statement
	const lastImportMatch = indexContent.match(/import .* from ".*";\n(?!import)/);
	if (lastImportMatch?.index !== undefined) {
		indexContent =
			indexContent.slice(0, lastImportMatch.index + lastImportMatch[0].length) +
			importStatement +
			indexContent.slice(lastImportMatch.index + lastImportMatch[0].length);
	} else {
		// Fallback if no imports found (unlikely)
		indexContent = importStatement + indexContent;
	}

	// Add rule to the rules object
	const ruleEntry = `\t\t"${ruleName}": ${ruleNameCamelCase},\n`;
	const rulesObjectRegex = /rules: {\s*([\s\S]*?)\s*},/m;
	const rulesMatch = indexContent.match(rulesObjectRegex);

	if (rulesMatch) {
		const existingRules = rulesMatch[1];
		if (existingRules === undefined) {
			throw new Error("No existing rules found.");
		}

		// Find the correct alphabetical position
		const lines = existingRules.trim().split("\n");
		let insertIndex = lines.length;
		for (const [index, line] of lines.entries()) {
			const lineRuleNameMatch = line.match(/"([^"]+)"/);
			if (lineRuleNameMatch?.[1] !== undefined && lineRuleNameMatch[1] > ruleName) {
				insertIndex = index;
				break;
			}
		}

		lines.splice(insertIndex, 0, ruleEntry.trim());
		const updatedRules = `\n${lines.join("\n")}\n\t`;
		indexContent = indexContent.replace(existingRules, updatedRules);

		writeFileSync(indexPath, indexContent);
		console.log(`Updated: ${indexPath}`);
	} else {
		console.error(
			`Could not find the 'rules' object in ${indexPath}. Please add the rule manually.`,
		);
	}
} catch (err) {
	console.error(`Error updating ${indexPath}:`, err);
	console.error(`Please add the following manually to ${indexPath}:`);
	console.error(`  Import: import { ${ruleNameCamelCase} } from "./rules/${ruleName}/rule";`);
	console.error(`  Rule entry: "${ruleName}": ${ruleNameCamelCase},`);
}

console.log(`\nSuccessfully created rule "${ruleName}".`);
console.log("Next steps:");
console.log("1. Implement the rule logic in", join(ruleDirectoryPath, "rule.ts"));
console.log("2. Write tests in", join(ruleDirectoryPath, "rule.spec.ts"));
console.log("3. Update the documentation in", join(ruleDirectoryPath, "documentation.md"));
console.log("4. Run `pnpm eslint-docs` to update the README.");
console.log("5. Consider adding the rule to the recommended config in src/index.ts if applicable.");
