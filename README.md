# eslint-plugin-roblox-ts

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href] [![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A collection of ESLint rules specifically targeted to flag common issues when
using [roblox-ts](https://roblox-ts.github.io/roblox-ts/). These rules are
nearly all designed to help avoid compiler errors for features that are not
supported by the roblox-ts compiler, despite being valid TypeScript.

These rules should help users learn roblox-ts when coming from Lua, as well as
guiding users who already know TypeScript to avoid unsupported features.

## Rules

<!-- Do not manually modify this list. Run: `npm run eslint-docs` -->
<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).\
💭 Requires [type information](https://typescript-eslint.io/linting/typed-linting).

| Name                                                                                  | Description                                                               | 🔧 | 💡 | 💭 |
| :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------ | :- | :- | :- |
| [lua-truthiness](src/rules/lua-truthiness/documentation.md)                           | Enforces the use of lua truthiness                                        |    |    | 💭 |
| [misleading-lua-tuple-checks](src/rules/misleading-lua-tuple-checks/documentation.md) | Disallow the use of LuaTuple in conditional expressions                   | 🔧 |    | 💭 |
| [no-any](src/rules/no-any/documentation.md)                                           | Disallow values of type `any`. Use `unknown` instead                      | 🔧 | 💡 |    |
| [no-array-pairs](src/rules/no-array-pairs/documentation.md)                           | Disallow usage of pairs() and ipairs() with Array<T>                      |    |    | 💭 |
| [no-enum-merging](src/rules/no-enum-merging/documentation.md)                         | Disallow merging enum declarations                                        |    |    |    |
| [no-export-assignment-let](src/rules/no-export-assignment-let/documentation.md)       | Disallow using `export =` on a let variable                               |    |    |    |
| [no-for-in](src/rules/no-for-in/documentation.md)                                     | Disallow iterating with a for-in loop                                     | 🔧 |    |    |
| [no-function-expression-name](src/rules/no-function-expression-name/documentation.md) | Disallow the use of function expression names                             | 🔧 |    |    |
| [no-get-set](src/rules/no-get-set/documentation.md)                                   | Disallow getters and setters                                              | 🔧 |    |    |
| [no-implicit-self](src/rules/no-implicit-self/documentation.md)                       | Enforce the use of `.` instead of `:` for method calls                    | 🔧 |    |    |
| [no-invalid-identifier](src/rules/no-invalid-identifier/documentation.md)             | Disallow the use of Luau reserved keywords as identifiers                 |    |    |    |
| [no-namespace-merging](src/rules/no-namespace-merging/documentation.md)               | Disallow merging namespace declarations                                   |    |    |    |
| [no-null](src/rules/no-null/documentation.md)                                         | Disallow usage of the `null` keyword                                      | 🔧 |    |    |
| [no-object-math](src/rules/no-object-math/documentation.md)                           | Enforce DataType math methods over operators                              | 🔧 |    | 💭 |
| [no-post-fix-new](src/rules/no-post-fix-new/documentation.md)                         | Disallow .new() on objects without a .new() method                        | 🔧 |    | 💭 |
| [no-preceding-spread-element](src/rules/no-preceding-spread-element/documentation.md) | Disallow spread elements not last in a list of arguments                  |    |    | 💭 |
| [no-private-identifier](src/rules/no-private-identifier/documentation.md)             | Disallow the use of private identifiers (`#`)                             | 🔧 |    |    |
| [no-undeclared-scope](src/rules/no-undeclared-scope/documentation.md)                 | Enforce that only npm scopes listed in typeRoots can be imported          |    |    | 💭 |
| [no-unsupported-syntax](src/rules/no-unsupported-syntax/documentation.md)             | Disallow unsupported syntax in roblox-ts                                  |    |    |    |
| [no-user-defined-lua-tuple](src/rules/no-user-defined-lua-tuple/documentation.md)     | Disallow usage of LuaTuple type keyword and $tuple() calls                | 🔧 |    |    |
| [no-value-typeof](src/rules/no-value-typeof/documentation.md)                         | Disallow using `typeof` to check for value types                          |    |    |    |
| [prefer-get-players](src/rules/prefer-get-players/documentation.md)                   | Enforces the use of Players.GetPlayers() instead of Players.GetChildren() | 🔧 |    |    |
| [prefer-task-library](src/rules/prefer-task-library/documentation.md)                 | Enforce use of task library alternatives                                  | 🔧 |    |    |
| [size-method](src/rules/size-method/documentation.md)                                 | Enforce use of .size() instead of .length or .size property               | 🔧 |    | 💭 |

<!-- end auto-generated rules list -->

<!-- Badges -->

[npm-version-src]:
	https://img.shields.io/npm/v/eslint-plugin-roblox-ts?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-roblox-ts
[npm-downloads-src]:
	https://img.shields.io/npm/dm/eslint-plugin-roblox-ts?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-roblox-ts
[bundle-src]:
	https://img.shields.io/bundlephobia/minzip/eslint-plugin-roblox-ts?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=eslint-plugin-roblox-ts
[license-src]:
	https://img.shields.io/github/license/roblox-ts/eslint-plugin-roblox-ts.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]:
	https://github.com/roblox-ts/eslint-plugin-roblox-ts/blob/main/LICENSE
[jsdocs-src]:
	https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/eslint-plugin-roblox-ts

## Installation

You'll first need to install [ESLint](https://eslint.org) v8.0.0 or greater:

```sh
npm install eslint --save-dev
```

**ESLint Version Support:**

- ESLint v8.x: ✅ Fully supported
- ESLint v9.x: ✅ Fully supported
- ESLint v10.x: ✅ Fully supported

Next, install `eslint-plugin-roblox-ts`:

```sh
npm install eslint-plugin-roblox-ts --save-dev
```

## Usage

The easiest way to use `eslint-plugin-roblox-ts` is to use the ready-made
config. Config files use all the rules of the current plugin, but you can
override them.

### Flat Config ([`eslint.config.ts`](https://eslint.org/docs/latest/use/configure/configuration-files))

```js
import roblox from "eslint-plugin-roblox-ts";

export default [roblox.configs.recommended];
```

### Legacy Config ([`.eslintrc`](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated))

```json
{
	"extends": ["plugin:roblox-ts/recommended-legacy"]
}
```

### Without Type Checking

`recommended` enables every rule, including those that need type information,
which requires the TypeScript project service and is the bulk of the lint cost.
If you want a faster pass, `recommendedNoTypeCheck` enables only the rules that
run without types, and skips the project service entirely.

```js
import roblox from "eslint-plugin-roblox-ts";

export default [roblox.configs.recommendedNoTypeCheck];
```

The legacy equivalent is `plugin:roblox-ts/recommended-no-type-check-legacy`.

### oxlint

The rules that run without type information are authored against oxlint's
[`createOnce`](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) API, so
they can be loaded by oxlint as a JS plugin.

```json
{
	"jsPlugins": ["eslint-plugin-roblox-ts"],
	"rules": {
		"roblox-ts/no-any": "error"
	}
}
```

Type-aware rules cannot run under oxlint, which has no type information; they
are exactly the rules excluded from `recommendedNoTypeCheck`.

### Manual Configuration

Altertatively, add `eslint-plugin-roblox-ts` to the plugins section of the
ESLint configuration file and define the list of rules you will use.

```js
import roblox from "eslint-plugin-roblox-ts";

export default [
	{
		plugins: {
			"roblox-ts": roblox,
		},
		rules: {
			"roblox-ts/no-any": ["error", { fixToUnknown: true }],
		},
	},
];
```

### Legacy Config ([`.eslintrc`](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated))

<!-- prettier-ignore -->
```json
{
	"extends": ["plugin:roblox-ts/recommended-legacy"]
}
```

Alternatively, add `eslint-plugin-roblox-ts` to the plugins section of your
`.eslintrc` configuration file and configure the rules you want to use.

<!-- prettier-ignore -->
```json
{
	"plugins": [
		"roblox-ts"
	],
	"rules": {
		"roblox-ts/no-any": ["error", { "fixToUnknown": true }],
		"roblox-ts/no-null": "error",
		"roblox-ts/no-object-math": "error"
	}
}
```

## Versioning Policy

This plugin is following [Semantic Versioning](https://semver.org/) and
[ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## Contributing

See
[Contributing Guide](https://github.com/roblox-ts/eslint-plugin-roblox-ts/blob/main/CONTRIBUTING.md).

## License

[MIT](./LICENSE) License © [roblox-ts](https://github.com/roblox-ts)
