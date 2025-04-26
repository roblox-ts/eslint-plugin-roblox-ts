# Disallow using `typeof` to check for value types

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

This rule warns when code uses the `typeof` operator to check the type of a value. In roblox-ts, the `typeof` operator is not available, and you should use `typeIs(value, type)` or `typeOf(value)` instead for type checks.

## Examples

```js
const t = typeof a; // ❌
const t = typeOf(a); // ✅
```

```js
if (typeof x === "string") {} // ❌
if (typeIs(x, "string")) {} // ✅
```
