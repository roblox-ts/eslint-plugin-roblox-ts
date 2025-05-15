# Enforce the use of `.` instead of `:` for method calls

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `pnpm eslint-docs` -->

## Rule details

In Lua, the colon (`:`) operator is used to call methods with an implicit `self` parameter, as in `object:method()`. However, in TypeScript and JavaScript, the dot (`.`) operator is used for method calls, and the colon is not valid syntax for calling functions or methods.

This rule enforces the use of the dot (`.`) operator for method calls in TypeScript code, and flags any usage of the colon (`:`) operator in a way that resembles Lua's implicit `self` calls. This helps prevent accidental use of Lua-style syntax in TypeScript, which can lead to confusing errors or unintended behavior, especially for developers transitioning from Roblox Lua to roblox-ts.

## Examples

Examples of **incorrect** code for this rule:

```js
foo:bar();
example:console.log('Hello World!');
foo:bar().baz();
```

Examples of **correct** code for this rule:

```js
foo.bar();
example.console.log('Hello World!');
const obj = { x: 5 };
const foo = { bar: function() {} };
foo.bar();
```
