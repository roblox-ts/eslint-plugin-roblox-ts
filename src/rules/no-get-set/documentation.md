# Disallow getters and setters

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule bans the use of `get` and `set` keywords in class and object literal
definitions due to not being supported in roblox-ts.

See [roblox-ts issue #457](https://github.com/roblox-ts/roblox-ts/issues/457) for more details.

### Suggestion

The rule offers a suggestion, not an autofix. The suggestion renames the
accessor to a normal method with a `get` or `set` prefix: `get value()` becomes
`getValue()`, and `set value(v)` becomes `setValue(v)`. The prefix keeps a
getter/setter pair as two different methods.

This change modifies the public API of the class or object. All callers must
change from `obj.value` to `obj.getValue()`, so the rule does not apply it
automatically. Type errors at the call sites show where to update.

There is no suggestion for computed keys (`get [key]()`), string or number
keys (`get "value"()`), private keys (`get #value()`), when a comment is
between the keyword and the key, or when the class or object already has a
member with the new name.

## Examples

### Incorrect

```js
class MyClass {
  private _value: number = 0;

  get value(): number { // ❌ Getter is not allowed
    return this._value;
  }

  set value(newValue: number) { // ❌ Setter is not allowed
    this._value = newValue;
  }
}

const obj = {
  _count: 0,
  get count() { // ❌ Getter is not allowed
    return this._count;
  },
  set count(value: number) { // ❌ Setter is not allowed
    this._count = value;
  }
};
```

### Correct

```js
class MyClass {
  private _value: number = 0;

  getValue(): number { // ✅ Use a regular method
    return this._value;
  }

  setValue(newValue: number): void { // ✅ Use a regular method
    this._value = newValue;
  }
}

const obj = {
  _count: 0,
  getCount(): number { // ✅ Use a regular method
    return this._count;
  },
  setCount(value: number): void { // ✅ Use a regular method
    this._count = value;
  }
};
```
