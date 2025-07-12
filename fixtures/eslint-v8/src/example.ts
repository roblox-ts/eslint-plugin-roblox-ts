// Example TypeScript file with rule violations for testing ESLint v8 compatibility
// This file intentionally contains violations to test the plugin

// 1. no-null rule violation (fixable)
let nullValue = null;

// 2. no-any rule violation (fixable + suggestion)
let anyValue: any = "test";

// 3. no-object-math rule violation (fixable + type-checking)
const vector1 = new Vector3(1, 2, 3);
const vector2 = new Vector3(4, 5, 6);
const vectorSum = vector1 + vector2; // Should use vector1.add(vector2)

// 4. no-array-pairs rule violation (type-checking)
const numbers = [1, 2, 3, 4, 5];
for (const [index, value] of pairs(numbers)) {
  print(`Index: ${index}, Value: ${value}`);
}

// 5. lua-truthiness rule violation (type-checking)
const possiblyUndefined: string | undefined = "test";
if (possiblyUndefined) { // Should use possiblyUndefined !== undefined
  print("Value exists");
}

// 6. no-enum-merging rule violation (error-only)
enum Color {
  Red = "red",
  Blue = "blue"
}

enum Color {
  Green = "green" // Merging enum declaration
}

// 7. no-invalid-identifier rule violation (error-only)
const luauFunction = "reserved"; // Should avoid reserved keywords

// 8. prefer-task-library rule violation (fixable)
wait(1); // Should use task.wait(1)

// 9. size-method rule violation (fixable + type-checking)
const arr = new Array<string>();
const length = arr.length; // Should use arr.size()

// 10. no-for-in rule violation (fixable)
const obj = { a: 1, b: 2, c: 3 };
for (const key in obj) { // Should use for (const key of Object.keys(obj))
  print(key);
}

// 11. no-private-identifier rule violation (fixable)
class TestClass {
  #privateField = "private"; // Should use private privateField
  
  constructor() {
    print(this.#privateField);
  }
}

// 12. no-get-set rule violation (fixable)
class GetSetClass {
  private _value = 0;
  
  get value() { // Should use regular method
    return this._value;
  }
  
  set value(v: number) { // Should use regular method
    this._value = v;
  }
}

// Valid code examples (should not trigger violations)
const validString = "hello world";
const validNumber = 42;
const validBoolean = true;

function validFunction() {
  return "This is valid";
}

export { validString, validNumber, validBoolean, validFunction };