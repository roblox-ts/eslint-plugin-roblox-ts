# Function expression names are not supported!

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

Roblox Lua does not support named function expressions (e.g., `local x = function foo() end`).

This rule prevents the use of named function expressions to maintain compatibility and avoid potential issues.

## Examples

```js
const myFunc = function someName() { // ❌
  // ...
};
```

```js
const myFunc = function() { // ✅
  // ...
};
```

```js
function declaredFunction() { // ✅ (Function declarations are allowed)
  // ...
}
```
