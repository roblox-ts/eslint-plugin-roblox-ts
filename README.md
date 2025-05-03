# eslint-plugin-roblox-ts-x

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A collection of ESLint rules specifically targeted for roblox-ts.

## Rules

<!-- Do not manually modify this list. Run: `npm run eslint-docs` -->
<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).\
💭 Requires [type information](https://typescript-eslint.io/linting/typed-linting).

| Name                                                                      | Description                                                                                                      | 🔧 | 💡 | 💭 |
| :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- | :- | :- | :- |
| [lua-truthiness](src/rules/lua-truthiness/documentation.md)               | Warns against falsy strings and numbers                                                                          |    |    | 💭 |
| [no-invalid-identifier](src/rules/no-invalid-identifier/documentation.md) | Disallows the use of Luau reserved keywords as identifiers.                                                      |    |    |    |
| [no-null](src/rules/no-null/documentation.md)                             | Disallow usage of the 'null' keyword in TypeScript.                                                              | 🔧 |    |    |
| [no-post-fix-new](src/rules/no-post-fix-new/documentation.md)             | Bans the use of .new() on objects without a .new() method. This is useful to help users transition to roblox-ts. | 🔧 | 💡 | 💭 |
| [no-value-typeof](src/rules/no-value-typeof/documentation.md)             | Disallow using `typeof` to check for value types.                                                                |    |    |    |
| [prefer-task-library](src/rules/prefer-task-library/documentation.md)     | Enforces use of task.wait(), task.delay(), and task.spawn() instead of global wait(), delay(), and spawn().      | 🔧 |    |    |
| [size-method](src/rules/size-method/documentation.md)                     | Enforces use of .size() method instead of .length or .size property for Roblox compatibility.                    | 🔧 |    | 💭 |

<!-- end auto-generated rules list -->

## License

[MIT](./LICENSE) License © [Christopher Buss](https://github.com/christopher-buss)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-roblox-ts-x?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-roblox-ts-x
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-roblox-ts-x?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-roblox-ts-x
[bundle-src]: https://img.shields.io/bundlephobia/minzip/eslint-plugin-roblox-ts-x?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=eslint-plugin-roblox-ts-x
[license-src]: https://img.shields.io/github/license/christopher-buss/eslint-plugin-roblox-ts-x.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/christopher-buss/eslint-plugin-roblox-ts-x/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/eslint-plugin-roblox-ts-x
