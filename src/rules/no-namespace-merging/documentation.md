# Disallow merging namespace declarations

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

TypeScript allows merging namespace (or module) declarations, where multiple `namespace` or `module` blocks with the same name contribute members to a single combined namespace. However, roblox-ts does not support this feature.

This rule prevents namespace merging by ensuring that each namespace name is declared only once within a given scope.

## Examples

### Incorrect

```js
namespace Utils {
  export function funcA() {}
}

namespace Utils { // ❌ Merging 'Utils' namespace is not allowed
  export function funcB() {}
}

module Config { // 'module' is equivalent to 'namespace'
  export const setting1 = true;
}

namespace Config { // ❌ Merging 'Config' namespace/module is not allowed
  export const setting2 = false;
}

function setup() {
  namespace State {
    export let count = 0;
  }

  namespace State { // ❌ Merging 'State' namespace within function scope
    export function increment() { count++; }
  }
}
```

### Correct

```js
namespace Utils {
  export function funcA() {}
  export function funcB() {}
} // ✅ All members declared in a single block

namespace Config {
  export const setting1 = true;
  export const setting2 = false;
} // ✅ Single namespace declaration

namespace Network {}
namespace Storage {} // ✅ Different namespaces are fine

namespace Network {}
namespace Storage {
	namespace Network {}   // ✅ Same name, but different scope
}
```
