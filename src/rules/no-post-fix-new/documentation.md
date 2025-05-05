# Disallow the use of .new() on objects without a .new() method

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule warns when code calls `.new()` on an object that does not have a `.new()` method. In roblox-ts, constructors should be called with the `new` keyword (e.g., `new X()`), not with a `.new()` method, unless the object actually defines a callable `.new()` method.

This helps prevent mistakes when moving from Lua to TypeScript, and ensures that object construction follows TypeScript conventions.

## Examples

```js
const foo = CFrame.new(); // ❌
const foo = new CFrame(); // ✅
```

```js
const foo = getClass().new(); // ❌
const foo = new (getClass())(); // ✅
```

```js
class MyClass { static new() { return new MyClass(); } }
const foo = MyClass.new(); // ✅ (allowed, because .new exists)
```

```js
const obj = { new: () => 123 };
obj.new(); // ✅ (allowed, because .new exists and is callable)
```
