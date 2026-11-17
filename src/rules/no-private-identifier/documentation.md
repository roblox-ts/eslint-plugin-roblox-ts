# Disallow the use of private identifiers (`#`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule bans the use of private identifiers (e.g., `#fieldName`) in classes,
as they are not supported in roblox-ts.

The fix renames the declaration and every use of the name together, and puts
`private` before other modifiers such as `static`. It does not fix a name when:

- the class already has a member with the same name, or
- the code uses a brand check (`#name in obj`), which has no `private`
  equivalent.

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
