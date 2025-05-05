# Disallows iterating with a for-in loop

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

The `for...in` statement iterates over the enumerable properties of an object.
However, in TypeScript (and consequently roblox-ts), the type of the iterator
variable in a `for...in` loop is always inferred as `string`. Due to this,
the `for...in` syntax is not supported in roblox-ts.

## Examples

```js
const obj = { a: 1, b: 2 };
for (const key in obj) { // 'key' is typed as string
	print(key, obj[key]); // ❌ for-in loop statements are not supported!
}
```

Examples of **correct** code for this rule:

```js
const arr = [10, 20, 30];
for (const value of arr) {
	print(value); // ✅ for-of loop statements are supported
}

arr.forEach((value, index) => {
	print(index, value); // ✅ forEach loop statements are supported
});

for (let i = 0; i < arr.length; i++) {
	print(i, arr[i]); // ✅ Standard for loop statements are supported
}
```

## When Not To Use It

This rule should not be used if you specifically need to iterate over all
enumerable properties of an object, including those in its prototype chain.
