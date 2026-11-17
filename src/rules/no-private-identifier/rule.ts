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

type PrivateMember =
	| TSESTree.AccessorProperty
	| TSESTree.MethodDefinition
	| TSESTree.PropertyDefinition;

function addToGroup<T>(groups: Map<string, Array<T>>, key: string, value: T): void {
	const group = groups.get(key);
	if (group === undefined) {
		groups.set(key, [value]);
	} else {
		group.push(value);
	}
}

/**
 * Builds one fix that renames a private name at its declarations and all of its
 * uses, so the code stays valid after the fix.
 *
 * @param context - The rule context.
 * @param members - The class members that declare the name.
 * @param identifiers - Every private identifier bound to the name.
 * @returns The fix function.
 */
function createFix(
	context: Context,
	members: ReadonlyArray<PrivateMember>,
	identifiers: ReadonlyArray<TSESTree.PrivateIdentifier>,
): TSESLint.ReportFixFunction {
	const { sourceCode } = context;

	return (fixer) => {
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
		(parent.type === AST_NODE_TYPES.PropertyDefinition ||
			parent.type === AST_NODE_TYPES.MethodDefinition ||
			parent.type === AST_NODE_TYPES.AccessorProperty) &&
		parent.key === node
	) {
		return parent;
	}

	return undefined;
}

/**
 * Collects the names of all non-`#` members of a class body, including
 * constructor parameter properties. A private name that matches one of these
 * cannot be renamed without a clash.
 *
 * @param body - The class body to scan.
 * @returns The static key of each member and parameter property.
 */
function getMemberNames(body: TSESTree.ClassBody): Set<string> {
	const names = new Set<string>();
	for (const member of body.body) {
		if (
			member.type === AST_NODE_TYPES.StaticBlock ||
			member.type === AST_NODE_TYPES.TSIndexSignature
		) {
			continue;
		}

		const name = getStaticKeyName(member.key, member.computed);
		if (name !== undefined) {
			names.add(name);
		}

		if (member.type === AST_NODE_TYPES.MethodDefinition && member.kind === "constructor") {
			for (const parameterName of getParameterPropertyNames(member)) {
				names.add(parameterName);
			}
		}
	}

	return names;
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

	return undefined;
}

/**
 * Checks for `#x in obj`. A `private` member has no equivalent check.
 *
 * @param node - The private identifier.
 * @returns Whether the identifier is the left side of an `in` check.
 */
function isBrandCheck(node: TSESTree.PrivateIdentifier): boolean {
	return node.parent.type === AST_NODE_TYPES.BinaryExpression && node.parent.left === node;
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

/**
 * Binds the private identifiers of a finished class body to its declarations
 * and reports them. A use of a name that this class does not declare belongs to
 * an enclosing class, so it moves to the outer frame.
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

	if (bound.size === 0) {
		return;
	}

	const memberNames = getMemberNames(frame.body);
	for (const [name, identifiers] of bound) {
		const isFixable = !memberNames.has(name) && !identifiers.some(isBrandCheck);
		const members = frame.declarations.get(name) ?? [];
		report(
			context,
			identifiers,
			isFixable ? createFix(context, members, identifiers) : undefined,
		);
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
