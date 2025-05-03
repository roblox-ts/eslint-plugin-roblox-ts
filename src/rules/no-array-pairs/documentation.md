# Disallows usage of pairs() and ipairs() with Array<T>

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

This rule disallows the usage of `pairs()` and `ipairs()` with `Array<T>` in
Lua. This is because `pairs()` and `ipairs()` do not shift the array indices to
match the array indices in TypeScript. This can lead to unexpected behavior
when using these functions with TypeScript arrays.

## Examples

```js
const arr = [1, 2, 3];
for (const [i] of pairs(arr)) { // ❌
	print(i); // 0, 1, 2
}
```

```js
const arr = [1, 2, 3];
for (const [i] of ipairs(arr)) { // ❌
	print(i); // 0, 1, 2
}
```

```js
const arr = [1, 2, 3];
for (const [i] of arr) { // ✅
	print(i); // 1, 2, 3 -> Correct lua behavior
}
```
