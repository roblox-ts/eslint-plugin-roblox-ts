# Disallow the use of private identifiers (`#`)

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule bans the use of private identifiers (e.g., `#fieldName`) in classes,
as they are not supported in roblox-ts.

This rule does not provide an autofix. Converting private identifiers requires
updating declarations and uses together, preserving modifier order, and checking
for name collisions and brand checks.

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
