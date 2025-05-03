# Disallows the use of Luau reserved keywords as identifiers

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

This rule prevents the use of identifiers that are reserved keywords in Luau but
not in TypeScript. Using these keywords as variable names, function names, class
names, etc., can cause syntax errors or unexpected behavior when the TypeScript
code is transpiled to Luau.

The following keywords are restricted: `and`, `elseif`, `end`, `error`, `local`,
`nil`, `not`, `or`, `repeat`, `then`, and `until`.

## Examples

### Incorrect

```js
const local = "my value"; // ❌ 'local' is a Luau keyword

function and(a: boolean, b: boolean): boolean { // ❌ 'and' is a Luau keyword
  return a && b;
}

let nil = undefined; // ❌ 'nil' is a Luau keyword

Promise.try(() => { /* ... */ }).catch(error => print(error)); // ❌ 'error' is a Luau keyword
```

### Correct

```js
const myLocal = "my value"; // ✅

function logicalAnd(a: boolean, b: boolean): boolean { // ✅
  return a && b;
}

let isNil = undefined; // ✅

Promise.try(() => { /* ... */ }).catch(err => print(err)); // ✅
```
