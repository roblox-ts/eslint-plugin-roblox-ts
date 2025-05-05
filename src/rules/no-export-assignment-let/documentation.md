# Disallow using `export =` on a let variable as it is not supported in roblox-ts

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

Disallows using `export =` with variables declared using `let`.

## Examples

```js
let count = 0;
export = count; // ❌ Exporting a 'let' variable via export=
```

```js
let value = 'initial';
value = 'updated';
export = value; // ❌ Variable is reassigned before export=
```

Examples of **correct** code for this rule:

```js

const count = 0;
export = count; // ✅ Exporting a 'const' variable

export = 42; // ✅ Exporting a literal value

export let mutableValue = 10; // ✅ Using named export for a 'let' variable

function greet() {
  console.log('Hello!');
}
export = greet; // ✅ Exporting a function or class
```
