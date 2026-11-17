// cspell:ignore metamethod quasis

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRobloxRule, type RobloxRuleListener } from "../../util";

export const RULE_NAME = "no-private-identifier";

const PRIVATE_IDENTIFIER_VIOLATION = "private-identifier-violation";

const messages = {
	[PRIVATE_IDENTIFIER_VIOLATION]:
		"Private identifiers (`#`) are not supported in roblox-ts. Use the 'private' access modifier instead.",
};

interface ClassFrame {
	readonly body: TSESTree.ClassBody;
	/** Declarations of each private name, keyed without the `#`. */
	readonly declarations: Map<string, Array<PrivateMember>>;
	/** Private identifiers in this class body, not yet bound to a class. */
	readonly identifiers: Array<TSESTree.PrivateIdentifier>;
}

type Context = Readonly<TSESLint.RuleContext<string, []>>;

interface MemberNames {
	readonly instance: Set<string>;
	/** False if a computed key or an index signature hides a name. */
	readonly isComplete: boolean;
	readonly static: Set<string>;
}

type PrivateMember =
	| TSESTree.AccessorProperty
	| TSESTree.MethodDefinition
	| TSESTree.PropertyDefinition;

/**
 * Names that change meaning if renamed. A `#constructor` becomes a real
 * constructor or a syntax error. The roblox-ts compiler compiles a `toString`
 * method to the `__tostring` metamethod, so a renamed `#toString` changes
 * behavior.
 */
const RESERVED_NAMES = new Set(["constructor", "toString"]);

/** Built-in `Function` properties that a static member cannot redeclare. */
const RESERVED_STATIC_NAMES = new Set(["arguments", "caller", "length", "name", "prototype"]);

function addToGroup<T>(groups: Map<string, Array<T>>, key: string, value: T): void {
	const group = groups.get(key);
	if (group === undefined) {
		groups.set(key, [value]);
	} else {
		group.push(value);
	}
}

function buildFixes(
	context: Context,
	fixer: TSESLint.RuleFixer,
	members: ReadonlyArray<PrivateMember>,
	identifiers: ReadonlyArray<TSESTree.PrivateIdentifier>,
): Array<TSESLint.RuleFix> | null {
	const { sourceCode } = context;
	const fixes: Array<TSESLint.RuleFix> = [];
	for (const member of members) {
		// `private` must come before `static`, `readonly`, `accessor`,
		// `async`, `get`, `set`, and `*`, but after decorators.
		const lastDecorator = member.decorators.at(-1);
		const firstToken =
			lastDecorator === undefined
				? sourceCode.getFirstToken(member)
				: sourceCode.getTokenAfter(lastDecorator);
		if (firstToken === null) {
			return null;
		}

		fixes.push(fixer.insertTextBefore(firstToken, "private "));
	}

	for (const node of identifiers) {
		fixes.push(fixer.replaceText(node, node.name));
	}

	return fixes;
}

/**
 * Builds one fix that renames every fixable private name of a class at its
 * declarations and all of its uses. One fix per class lets ESLint apply all
 * renames in one pass. The edits are built once and shared by all reports.
 *
 * @param context - The rule context.
 * @param members - The class members that declare the names.
 * @param identifiers - Every private identifier bound to the names.
 * @returns The fix function.
 */
function createFix(
	context: Context,
	members: ReadonlyArray<PrivateMember>,
	identifiers: ReadonlyArray<TSESTree.PrivateIdentifier>,
): TSESLint.ReportFixFunction {
	let cached: Array<TSESLint.RuleFix> | null | undefined;

	return (fixer) => {
		cached ??= buildFixes(context, fixer, members, identifiers);
		return cached;
	};
}

function createOnce(context: Context): RobloxRuleListener {
	let frames: Array<ClassFrame> = [];

	return {
		"before": () => {
			frames = [];
		},
		"ClassBody": (node: TSESTree.ClassBody) => {
			frames.push({ body: node, declarations: new Map(), identifiers: [] });
		},
		"ClassBody:exit": () => {
			const frame = frames.pop();
			if (frame !== undefined) {
				resolveFrame(context, frame, frames.at(-1));
			}
		},
		"PrivateIdentifier": (node: TSESTree.PrivateIdentifier) => {
			const frame = frames.at(-1);
			if (frame === undefined) {
				report(context, [node]);
				return;
			}

			frame.identifiers.push(node);
			const member = getDeclaringMember(node);
			if (member !== undefined) {
				addToGroup(frame.declarations, node.name, member);
			}
		},
	};
}

function getDeclaringMember(node: TSESTree.PrivateIdentifier): PrivateMember | undefined {
	const { parent } = node;
	if (
		parent.type === AST_NODE_TYPES.PropertyDefinition ||
		parent.type === AST_NODE_TYPES.MethodDefinition ||
		parent.type === AST_NODE_TYPES.AccessorProperty
	) {
		return parent;
	}

	return undefined;
}

/**
 * Collects the names of all non-`#` members of a class body, split into static
 * and instance members. Constructor parameter properties are instance members.
 * A private name that matches one of these cannot be renamed without a clash.
 *
 * @param body - The class body to scan.
 * @returns The member names, and whether every key could be resolved.
 */
function getMemberNames(body: TSESTree.ClassBody): MemberNames {
	const instance = new Set<string>();
	const staticNames = new Set<string>();
	// An index signature can clash with any name, like an unknown computed key.
	let isComplete = body.body.every((member) => member.type !== AST_NODE_TYPES.TSIndexSignature);
	for (const member of body.body) {
		if (
			member.type === AST_NODE_TYPES.StaticBlock ||
			member.type === AST_NODE_TYPES.TSIndexSignature ||
			member.key.type === AST_NODE_TYPES.PrivateIdentifier
		) {
			continue;
		}

		const name = getStaticKeyName(member.key, member.computed);
		if (name === undefined) {
			isComplete = false;
		} else {
			(member.static ? staticNames : instance).add(name);
		}

		if (member.type === AST_NODE_TYPES.MethodDefinition && member.kind === "constructor") {
			for (const parameterName of getParameterPropertyNames(member)) {
				instance.add(parameterName);
			}
		}
	}

	return { instance, isComplete, static: staticNames };
}

function getParameterPropertyNames(constructor: TSESTree.MethodDefinition): Array<string> {
	return constructor.value.params
		.filter((parameter) => parameter.type === AST_NODE_TYPES.TSParameterProperty)
		.map(({ parameter }) => {
			return parameter.type === AST_NODE_TYPES.AssignmentPattern
				? parameter.left.name
				: parameter.name;
		});
}

function getStaticKeyName(key: TSESTree.Node, computed: boolean): string | undefined {
	if (key.type === AST_NODE_TYPES.Identifier && !computed) {
		return key.name;
	}

	if (key.type === AST_NODE_TYPES.Literal) {
		return String(key.value);
	}

	if (key.type === AST_NODE_TYPES.TemplateLiteral && key.expressions.length === 0) {
		const [quasi] = key.quasis;
		return quasi?.value.cooked ?? undefined;
	}

	return undefined;
}

/**
 * Checks for `#x in obj`. A `private` member has no equivalent check.
 *
 * @param node - The private identifier.
 * @returns Whether the identifier is the left side of an `in` check.
 */
function isBrandCheck(node: TSESTree.PrivateIdentifier): boolean {
	return node.parent.type === AST_NODE_TYPES.BinaryExpression;
}

function isFixableName(
	name: string,
	members: ReadonlyArray<PrivateMember>,
	identifiers: ReadonlyArray<TSESTree.PrivateIdentifier>,
	memberNames: MemberNames,
): boolean {
	if (RESERVED_NAMES.has(name) || identifiers.some(isBrandCheck)) {
		return false;
	}

	return members.every((member) => {
		if (member.static) {
			return !RESERVED_STATIC_NAMES.has(name) && !memberNames.static.has(name);
		}

		return !memberNames.instance.has(name);
	});
}

function report(
	context: Context,
	identifiers: ReadonlyArray<TSESTree.PrivateIdentifier>,
	fix?: TSESLint.ReportFixFunction,
): void {
	for (const node of identifiers) {
		context.report({ fix, messageId: PRIVATE_IDENTIFIER_VIOLATION, node });
	}
}

function reportBound(
	context: Context,
	frame: ClassFrame,
	bound: ReadonlyMap<string, ReadonlyArray<TSESTree.PrivateIdentifier>>,
): void {
	const memberNames = getMemberNames(frame.body);
	const canFix = memberNames.isComplete && frame.body.parent.superClass === null;
	const fixable: Array<TSESTree.PrivateIdentifier> = [];
	const fixableMembers: Array<PrivateMember> = [];
	for (const [name, identifiers] of bound) {
		const members = frame.declarations.get(name) ?? [];
		if (canFix && isFixableName(name, members, identifiers, memberNames)) {
			fixable.push(...identifiers);
			fixableMembers.push(...members);
		} else {
			report(context, identifiers);
		}
	}

	report(context, fixable, createFix(context, fixableMembers, fixable));
}

/**
 * Binds the private identifiers of a finished class body to its declarations
 * and reports them. A use of a name that this class does not declare belongs to
 * an enclosing class, so it moves to the outer frame.
 *
 * All fixable names share one fix. A class with an `extends` clause, or with a
 * computed key that cannot be resolved, or with an index signature, gets no
 * fix, because a renamed member could clash with a member it cannot see.
 *
 * @param context - The rule context.
 * @param frame - The class body that just finished.
 * @param outer - The enclosing class body, if any.
 */
function resolveFrame(context: Context, frame: ClassFrame, outer: ClassFrame | undefined): void {
	const bound = new Map<string, Array<TSESTree.PrivateIdentifier>>();
	const unbound: Array<TSESTree.PrivateIdentifier> = [];
	for (const node of frame.identifiers) {
		if (frame.declarations.has(node.name)) {
			addToGroup(bound, node.name, node);
		} else {
			unbound.push(node);
		}
	}

	if (outer === undefined) {
		report(context, unbound);
	} else {
		outer.identifiers.push(...unbound);
	}

	if (bound.size > 0) {
		reportBound(context, frame, bound);
	}
}

export const noPrivateIdentifier = createRobloxRule({
	name: RULE_NAME,
	createOnce,
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow the use of private identifiers (`#`)",
			recommended: true,
			requiresTypeChecking: false,
		},
		fixable: "code",
		messages,
		schema: [],
		type: "problem",
	},
});
