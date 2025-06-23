<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `pnpm eslint-docs` -->

## Rule details

Roblox features a bunch of "DataType" classes like Vector2, Vector3, CFrame, etc. that support math operations. However, TypeScript does not have a way to describe operator overloading with types. To solve this, roblox-ts provides macro methods that compile to the appropriate operators:

- `.add()` (compiles to `+`)
- `.sub()` (compiles to `-`)
- `.mul()` (compiles to `*`)
- `.div()` (compiles to `/`)

This rule enforces using these macro methods instead of direct operators for better type safety and code clarity.

## Examples

Examples of **incorrect** code for this rule:

```ts
const vector1 = new Vector2(1, 2);
const vector2 = new Vector2(3, 4);
const result = vector1 + vector2; // TypeScript can't properly type this

const position = new Vector3(0, 0, 0);
const scaled = position * 2; // No type checking

const cframe1 = new CFrame();
const cframe2 = new CFrame();
const combined = cframe1 + cframe2; // No proper typing
```

Examples of **correct** code for this rule:

```ts
const vector1 = new Vector2(1, 2);
const vector2 = new Vector2(3, 4);
const result = vector1.add(vector2); // Properly typed

const position = new Vector3(0, 0, 0);
const scaled = position.mul(2); // Type-safe

const cframe1 = new CFrame();
const cframe2 = new CFrame();
const combined = cframe1.add(cframe2); // Type-safe
```

## Supported DataTypes

This rule applies to the following Roblox DataTypes:
- CFrame
- UDim
- UDim2
- Vector2
- Vector2int16
- Vector3
- Vector3int16

## Further Reading

- [Roblox-TS DataType Math Guide](https://roblox-ts.com/docs/guides/datatype-math)
- [Macro Math Type Definitions](https://github.com/roblox-ts/types/blob/master/include/macro_math.d.ts)
