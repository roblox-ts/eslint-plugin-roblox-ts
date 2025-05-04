# Bans spread elements not last in a list of arguments from being used,

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

Disallows spread elements (`...`) from appearing anywhere except as the last element in a function or constructor call argument list.

## Examples

Examples of **incorrect** code for this rule:

```js
// Spread element is not the last argument
print(1, ...[2, 3], 4);
fn(...args, 1);
new Cls(...args, 1);
math.max(...numbers, 0);
```

Examples of **correct** code for this rule:

```js
// Spread element is the last argument
print(...args);
print(1, ...args);
fn(a, b, ...c);
new Cls(...args);
new Cls(1, ...args);
new Cls(a, b, ...c);

// Spread elements in array/object literals are allowed
const arr = [...otherArr, 1];
const arr2 = [1, ...otherArr, 2];
const arr3 = [1, 2, ...otherArr];
const obj = { ...a, b: 1 };
const obj2 = { a: 1, ...b };
const obj3 = { a: 1, ...b, c: 2 };

// Rest parameters in function definitions are allowed
function foo(...args) {}
function bar(a, ...args) {}
const baz = (...args) => {}
const qux = (a, b, ...args) => {}
```
