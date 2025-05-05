# Disallow values of type `any`. Use `unknown` instead

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

The `any` type in TypeScript effectively disables type checking for the value it's applied to. While sometimes convenient, it undermines the safety benefits of TypeScript and is generally discouraged, especially in environments like roblox-ts where type safety is crucial.

This rule bans the use of `any` and recommends using `unknown` instead. The `unknown` type is a safer alternative because it forces you to perform explicit type checks or assertions before performing operations on the value.

## Examples

### Incorrect

```js
let value: any; // ❌ 'any' is disallowed
value = "hello";
value = 123;
value.upper(); // ❌ Unsafe operation, no type checking

function process(data: any): any { // ❌ 'any' in parameters and return type
  return data.result; // ❌ Unsafe property access
}

type Data = {
  payload: any; // ❌ 'any' in type definition
};

const list: Array<any> = [1, "two"]; // ❌ 'any' in generic type argument
```

### Correct

```js
let value: unknown; // ✅ Use 'unknown' instead
value = "hello";
value = 123;

// Explicit type check required before use
if (typeof value === "string") {
  value.upper(); // ✅ Safe operation within type guard
}

function process(data: unknown): unknown { // ✅ Use 'unknown'
  // Perform checks or assertions before accessing properties
  if (typeof data === "object" && data !== undefined && "result" in data) {
    return data.result; // ✅ Safe access after check
  }

  return undefined;
}

type Data = {
  payload: unknown; // ✅ Use 'unknown'
};

// Prefer specific types or 'unknown' for arrays
const listStrings: Array<string> = ["one", "two"];
const listMixed: Array<string | number> = [1, "two"];
const listUnknown: Array<unknown> = [1, "two", true];
```

## Options

<!-- begin auto-generated rule options list -->

| Name           | Description                                                                                | Type    |
| :------------- | :----------------------------------------------------------------------------------------- | :------ |
| `fixToUnknown` | Whether to enable auto-fixing in which the `any` type is converted to the `unknown` type.' | Boolean |

<!-- end auto-generated rule options list -->
