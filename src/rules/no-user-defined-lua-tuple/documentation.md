# Disallow usage of LuaTuple type keyword and $tuple() calls

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `pnpm eslint-docs` -->

## Rule details

In Luau, functions can return multiple values. roblox-ts provides `LuaTuple<T>`
and the `$tuple()` macro to represent these multiple return values in
TypeScript. `LuaTuple<T>` is a special type that signals to the roblox-ts
compiler that a function's return should be treated as a Luau multiple return,
rather than a standard TypeScript array. The `$tuple()` macro is a utility to
create `LuaTuple` instances.

While `LuaTuple<T>` and `$tuple()` are essential for accurately typing existing
Luau modules or Roblox API functions that use multiple returns (e.g.,
`Workspace.FindPartOnRay`), their use in user-defined functions and variables is
generally discouraged.

This rule enforces the use of standard TypeScript tuple types (e.g., `[string,
number]`) and tuple expressions (e.g., `["hello", 123]`) in your own code
instead of `LuaTuple<T>` and `$tuple()`.

While there might be rare cases where you need to define a function that
explicitly returns a `LuaTuple` (e.g., when creating a module intended to be
consumed by existing Luau code that expects multiple return values), these
situations are uncommon. In most scenarios, standard TypeScript tuples are the
preferred solution.

## Examples

Examples of **incorrect** code for this rule:

```js
type X = LuaTuple<[string, number]>;
const a = $tuple(1, "two");

function foo(): LuaTuple<[number, string]> {}
const b = () => $tuple(true, false);
```

Examples of **correct** code for this rule:

```js
type X = [string, number];
const a = [1, "two"];

function foo(): [number, string] {}
const b = () => [true, false];
```

## Options

<!-- begin auto-generated rule options list -->

| Name              | Description                                                                                               | Type    | Default |
| :---------------- | :-------------------------------------------------------------------------------------------------------- | :------ | :------ |
| `allowTupleMacro` | Whether to allow the $tuple(...) macro call                                                               | Boolean | `false` |
| `shouldFix`       | Whether to enable auto-fixing in which the `LuaTuple` type is converted to a native TypeScript tuple type | Boolean | `true`  |

<!-- end auto-generated rule options list -->

Example configuration with options:

```json
{
	"roblox-ts/no-user-defined-lua-tuple": ["error", { "shouldFix": true, "allowTupleMacro": false }]
}
```

## Further Reading

https://roblox-ts.com/docs/guides/lua-tuple#using-luatuplet-in-your-own-code
