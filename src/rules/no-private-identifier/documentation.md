# Disallows the use of private identifiers (`#`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

This rule bans the use of private identifiers (e.g., `#fieldName`) in classes,
as they are not supported in roblox-ts.

## Examples

### Incorrect

```js
class MyClass {
  #privateField = 1; // ❌ Private identifier is not allowed

  #privateMethod() { // ❌ Private identifier is not allowed
    // ...
  }
}
```

### Correct

```js
class MyClass {
  private privateField = 1; // ✅ Use 'private' keyword

  private privateMethod() { // ✅ Use 'private' keyword
    // ...
  }
}
```
