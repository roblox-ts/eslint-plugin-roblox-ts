# Enforces the use of lua truthiness in roblox-ts

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule warns when code relies on the truthiness of strings or numbers in
conditional expressions. In TypeScript, values like `0`, `NaN`, and `""` (empty
string) are considered falsy, but in Lua, only `false` and `nil` are falsy. This
rule helps to ease the transition from TypeScript to Lua by ensuring that your
conditions act as you would expect them to in Lua.

You are free to turn off this rule if you are sure of the behavior of TypeScript
truthiness and wish for this behavior to be preserved in Lua.

## Examples

```js
const y = "";
if (!y) {} // ❌
if (y !== "") {} // ✅
```

```js
const x = 0;
if (!x) {} // ❌
if (x !== 0) {} // ✅
```

```js
function check<T>(a: T) {
	if (a) {} // ❌
	if (a !== undefined) {} // ✅
}
```

```js
if ([].size()) {} // ❌
if ([].size() !== 0) {} // ✅
```
