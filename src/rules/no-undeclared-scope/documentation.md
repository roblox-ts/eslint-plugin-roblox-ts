# Enforce that only npm scopes listed in typeRoots can be imported

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `pnpm eslint-docs` -->

## Rule details

This rule enforces that only npm packages from scopes explicitly listed in your
`tsconfig.json`'s `typeRoots` configuration can be imported.

In roblox-ts projects, the `typeRoots` setting is required for managing which
npm packages and their type definitions are available.
 
## Examples

### Incorrect

Examples of **incorrect** code for this rule:

```ts
// Assuming tsconfig.json has: "typeRoots": ["node_modules/@rbxts"]

import { Flamework } from "@flamework/core"; // ❌ @flamework scope not in typeRoots

// All import types are checked
import type { Config } from "@flamework/core"; // ❌ Type imports also checked
import * as Flamework from "@flamework/core"; // ❌ Namespace imports checked
export { Component } from "@flamework/components"; // ❌ Re-exports checked
export * from "@flamework/core"; // ❌ Export all checked

// Dynamic imports are also checked
const module = await import("@flamework/core"); // ❌ Dynamic imports checked
import("@halcyon/bootstrap").then(m => {}); // ❌
 
// Even side-effect imports
import "@flamework/core"; // ❌
```

### Correct

Examples of **correct** code for this rule:

```ts
// Assuming tsconfig.json has: "typeRoots": ["node_modules/@rbxts"]

// Imports from configured scopes are allowed
import { Players } from "@rbxts/services"; // ✅ @rbxts is in typeRoots
import type { Component } from "@rbxts/react"; // ✅
export { HttpService } from "@rbxts/services"; // ✅

// Non-scoped packages are always allowed
import lodash from "lodash"; // ✅ Not a scoped package
import * as React from "react"; // ✅

// Relative imports are always allowed
import { myUtil } from "./utils"; // ✅
import { Component } from "../components/Component"; // ✅
import config from "../../config.json"; // ✅

// Dynamic imports from configured scopes
const services = await import("@rbxts/services"); // ✅
```

## How to fix

When this rule reports an error, you have two options:

### Option 1: Add the scope to typeRoots (recommended)

Update your `tsconfig.json` to include the package scope in `typeRoots`:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "node_modules/@rbxts",
      "node_modules/@flamework"
    ]
  }
}
```

### Option 2: Remove the import

If the package shouldn't be used, remove the import and use an alternative from
an allowed scope.


## Further Reading

- [TypeScript `typeRoots`
  documentation](https://www.typescriptlang.org/tsconfig#typeRoots)
- [roblox-ts npm packages](https://www.npmjs.com/org/rbxts)
