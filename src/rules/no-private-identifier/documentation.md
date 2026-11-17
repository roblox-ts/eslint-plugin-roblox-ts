# Disallow the use of private identifiers (`#`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule bans the use of private identifiers (e.g., `#fieldName`) in classes,
as they are not supported in roblox-ts.

The fix renames the declaration and every use of the name together, and puts
`private` before other modifiers such as `static`. It does not fix a name when:

- the class already has a member with the same name, both static or both
  instance (constructor parameter properties count as instance members),
- the name is `constructor`,
- the name is `toString`, because roblox-ts compiles a `toString` method to the
  `__tostring` metamethod,
- the name is static and is `name`, `length`, `prototype`, `caller`, or
  `arguments`, which clash with built-in function properties,
- the code uses a brand check (`#name in obj`), which has no `private`
  equivalent,
- the class has an `extends` clause, because the name can clash with an
  inherited member,
- the class has a computed member key that is not a literal, such as
  `[key]()`, because its name is not known, or
- the class has an index signature, such as `[key: string]: string`, because
  the new `private` member can clash with it.

A subclass, in this file or in another file, can still declare a member with
the same name. That member then clashes with the new `private` member.

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
