# Disallow getters and setters

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

This rule bans the use of `get` and `set` keywords in class and object literal
definitions due to not being supported in roblox-ts.

See [roblox-ts issue #457](https://github.com/roblox-ts/roblox-ts/issues/457) for more details.

The autofix removes the accessor keyword and keeps the method's key and modifiers.
When the same class body or object literal contains a getter and a setter with the
same statically known name, the rule reports both without an autofix. Convert
these pairs manually to avoid creating duplicate methods.

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
