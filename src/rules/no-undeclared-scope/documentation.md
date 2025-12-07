# Enforce that only npm scopes listed in typeRoots can be imported

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `pnpm eslint-docs` -->

## Rule details

This rule enforces that only npm packages from scopes explicitly listed in your
`tsconfig.json`'s `typeRoots` configuration can be imported. Additionally, it
validates that scopes declared in `typeRoots` actually exist in `node_modules`.

Path aliases configured in `compilerOptions.paths` are also allowed.

In roblox-ts projects, the `typeRoots` setting is required for managing which
npm packages and their type definitions are available.

The rule checks two conditions:
1. **Undeclared scope**: A scoped package is imported but its scope is not listed in `typeRoots`
2. **Missing scope**: A scope is listed in `typeRoots` but the directory doesn't exist in `node_modules`
 
## Examples

### Incorrect

Examples of **incorrect** code for this rule:

```ts
// Assuming tsconfig.json has: "typeRoots": ["node_modules/@rbxts"]

// Error: Undeclared scope - @flamework not in typeRoots
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

```ts
// Assuming tsconfig.json has: "typeRoots": ["node_modules/@rbxts", "node_modules/@missing"]
// But @missing directory doesn't exist in node_modules

// Error: Missing scope - @missing is in typeRoots but directory not found
import { Component } from "@missing/package"; // ❌ Scope declared but not installed
import type { Config } from "@missing/types"; // ❌
export * from "@missing/utils"; // ❌
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

// Path aliases from tsconfig paths are allowed
// Assuming: "paths": { "@shared/*": ["./src/shared/*"] }
import { util } from "@shared/utils"; // ✅
export { thing } from "@shared/components"; // ✅
```

## How to fix

### For "undeclared scope" errors

When the rule reports that a scope is not in `typeRoots`, you have two options:

#### Option 1: Add the scope to typeRoots (recommended)

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

#### Option 2: Remove the import

If the package shouldn't be used, remove the import and use an alternative from
an allowed scope.

### For "scope not found" errors

When the rule reports that a scope is declared in `typeRoots` but the directory
doesn't exist, you need to install the packages:

#### Option 1: Install the packages

Run your package manager to install missing dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

#### Option 2: Remove the scope from typeRoots

If you no longer need this scope, remove it from your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "node_modules/@rbxts"
      // Removed "node_modules/@missing"
    ]
  }
}
```


## Further Reading

- [TypeScript `typeRoots`
  documentation](https://www.typescriptlang.org/tsconfig#typeRoots)
- [roblox-ts npm packages](https://www.npmjs.com/org/rbxts)
