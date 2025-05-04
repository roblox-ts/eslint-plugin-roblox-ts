# Disallows unsupported syntax like `globalThis`, `.prototype`, and regex literals

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

This rule bans the use of certain TypeScript syntax features that are not supported or behave differently in the roblox-ts environment.

Currently, this rule disallows:

-   `globalThis`: This global object is not available in the Roblox environment.
-   `.prototype`: Accessing the `prototype` property of constructors is not supported and can lead to errors.
-   Regex Literals (`/pattern/flags`): These are not directly supported. Use the `RegExp` constructor instead.

## Examples

### Incorrect

```js
// globalThis
const win = globalThis; // ❌ globalThis is not supported

// .prototype
function MyConstructor() {}
const proto = MyConstructor.prototype; // ❌ .prototype is not supported

class MyClass {}
const classProto = MyClass.prototype; // ❌ .prototype is not supported

// Regex Literals
const pattern = /abc/i; // ❌ Regex literals are not supported
if (/test/.test(str)) { // ❌ Regex literals are not supported
  // ...
}
```

### Correct

```js
// Instead of globalThis, use specific globals if available or manage state differently.

// Instead of .prototype, use static methods or other patterns.
class MyClass {
  static staticMethod() {}
}
MyClass.staticMethod();

// Instead of regex literals, you can use the RegExp constructor from `@rbxts/luau-polyfill`.
const pattern = new RegExp("abc", "i");
if (new RegExp("test").test(str)) {
  // ...
}
```
