# Enforce DataType math methods over operators

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule details

In standard TypeScript, you can use operators like `+`, `-`, `*`, `/` for
mathematical operations. However, when working with Roblox data types like
`Vector3`, `CFrame`, `UDim2`, etc., TypeScript does not have a way to describe
operator overloading with types.

To solve this, roblox-ts adds macro methods .add(), .sub(), .mul(), .div(), and
.idiv() to DataType classes which support math operators. The first four
correspond to operators +, -, *, / respectively, while .idiv() provides integer
division functionality.

## Examples

```js
const v1 = new Vector3(1, 0, 0);
const v2 = new Vector3(0, 1, 0);
const sum = v1 + v2; // ❌ Incorrect: Using '+' operator for Vector3 addition
const sum = v1.add(v2); // ✅ Correct: Using .add() method for Vector3 addition

const cf1 = new CFrame();
const cf2 = new CFrame();
const product = cf1 * cf2; // ❌ Incorrect: Using '*' operator for CFrame multiplication
const product = cf1.mul(cf2); // ✅ Correct: Using .mul() method for CFrame multiplication

const u1 = new UDim2();
const u2 = new UDim2();
const difference = u1 - u2; // ❌ Incorrect: Using '-' operator for UDim2 subtraction
const difference = u1.sub(u2); // ✅ Correct: Using .sub() method for UDim2 subtraction

const vec2 = new Vector2();
const quotient = vec2 / 2; // ❌ Incorrect: Using '/' operator for Vector2 division
const quotient = vec2.div(2); // ✅ Correct: Using .div() method for Vector2 division

const vec3 = new Vector3(10, 20, 30);
const intDivision = vec3.idiv(3); // ✅ Correct: Using .idiv() method for integer division

const isGreater = v1 > v2; // ❌ Incorrect: Using '>' operator on Vector3

const cf = new CFrame();
const invalidDiv = cf / 2; // ❌ Incorrect: CFrame doesn't support division

## Further Reading

- [Roblox-TS DataType MathGuide](https://roblox-ts.com/docs/guides/datatype-math)
- [Macro Math TypeDefinitions](https://github.com/roblox-ts/types/blob/master/include/macro_math.d.ts)
