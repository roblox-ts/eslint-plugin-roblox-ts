# Disallow usage of the `null` keyword

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule warns when code uses the `null` keyword. In Roblox TS, `null` is not idiomatic and you should use `undefined` instead. The fixer will automatically replace `null` with `undefined`.

## Examples

```js
const a = null; // ❌
const a = undefined; // ✅
```

```js
if (foo === null) {} // ❌
if (foo === undefined) {} // ✅
```

```js
function bar(x: number | null) { return x === null ? 0 : x; } // ❌
function bar(x: number | undefined) { return x === undefined ? 0 : x; } // ✅
```
