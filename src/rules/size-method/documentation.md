# Enforce use of .size() method instead of .length or .size property for Roblox compatibility

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule automatically replaces `.length` and `.size` property accesses on arrays, strings, Set, Map, WeakSet, and WeakMap with a `.size()` method call. This is necessary for Roblox compatibility, as these properties do not exist in roblox-ts.

## Examples

```js
const n = arr.length; // ❌
const n = arr.size(); // ✅

const n = str.length; // ❌
const n = str.size(); // ✅

const n = set.size; // ❌
const n = set.size(); // ✅

const n = map.size; // ❌
const n = map.size(); // ✅

const n = weakSet.size; // ❌
const n = weakSet.size(); // ✅

const n = weakMap.size; // ❌
const n = weakMap.size(); // ✅
```
