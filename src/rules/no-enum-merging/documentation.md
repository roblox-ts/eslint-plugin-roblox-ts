# Disallow merging enum declarations

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

TypeScript allows merging enum declarations, where multiple `enum` blocks with the same name contribute members to a single combined enum. However, roblox-ts does not support this feature.

This rule prevents enum merging by ensuring that each enum name is declared only once within a given scope.

## Examples

### Incorrect

```js
enum Color {
  Red,
}

enum Color { // ❌ Merging 'Color' enum is not allowed
  Green,
  Blue,
}

function foo() {
  enum Status {
    Pending,
  }
  enum Status { // ❌ Merging 'Status' enum within function scope
    Complete,
  }
}

namespace MyNamespace {
    enum Direction { Up }
    enum Direction { Down } // ❌ Merging 'Direction' enum within namespace
}
```

### Correct

```js
enum Color {
  Red,
  Green,
  Blue,
} // ✅ All members declared in a single block

function foo() {
  enum Status {
    Pending,
    Complete,
  } // ✅ Single enum declaration in function scope
}

namespace MyNamespace {
    enum Direction { Up, Down } // ✅ Single enum declaration in namespace
}

enum Fruit { Apple }
enum Vegetable { Carrot } // ✅ Different enums are fine

function bar() {
    enum Fruit { Banana } // ✅ Same name, but different scope
}
```
