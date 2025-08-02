// Root-level TypeScript file that should NOT trigger roblox-ts rules
// This simulates a config file that would be at the project root

// These violations should NOT be flagged by roblox-ts rules due to file constraint
let nullValue = null; // no-null rule should NOT trigger
let anyValue: any = "test"; // no-any rule should NOT trigger
wait(1); // prefer-task-library rule should NOT trigger

const obj = { a: 1, b: 2 };
for (const key in obj) { // no-for-in rule should NOT trigger
  // Process the key
  const value = obj[key as keyof typeof obj];
}

export const testConfig = {
  nullValue,
  anyValue,
  obj,
};