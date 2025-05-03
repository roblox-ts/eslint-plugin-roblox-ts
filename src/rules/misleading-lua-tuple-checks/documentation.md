# Disallows the use of LuaTuple in conditional expressions.

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

In Luau, functions can return multiple values, represented in roblox-ts by the
`LuaTuple<T>` type. When a `LuaTuple` is used directly in a conditional
expression (like `if`, `while`, ternary operators, logical operators), it always
evaluates to `true` regardless of the values it contains. This is because tables
(which `LuaTuple` transpiles to) are always truthy in Luau.

This rule prevents this potentially misleading behavior by requiring you to
explicitly access the first element of the tuple (e.g., `myTuple[0]`) when using
it in a conditional context. This ensures the condition evaluates based on the
actual boolean value intended.

This rule is autofixable.

## Examples

### Incorrect

```js
declare const myTuple: LuaTuple<[boolean, number]>;

if (myTuple) { // ❌ Always true in Luau, regardless of the boolean value
  // ...
}

const result = myTuple ? "Truthy" : "Falsy"; // ❌ Ternary condition is always true

while (!myTuple) { // ❌ Condition is always false
  // ...
}

if (someCondition && myTuple) { // ❌ Second part of the condition is always true
  // ...
}
```

### Correct

```js
declare const myTuple: LuaTuple<[boolean, number]>;

if (myTuple[0]) { // ✅ Evaluates the boolean value correctly
  // ...
}

const result = myTuple[0] ? "Truthy" : "Falsy"; // ✅ Correctly uses the first element

while (!myTuple[0]) { // ✅ Correctly negates the first element
  // ...
}

if (someCondition && myTuple[0]) { // ✅ Correctly uses the first element in the logical expression
  // ...
}

const [isValid, value] = myTuple; // ✅ Destructuring is fine
```
