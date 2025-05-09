# Enforces the use of Players.GetPlayers() instead of Players.GetChildren()

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `pnpm eslint-docs` -->

## Rule details

This rule encourages the use of `Players.GetPlayers()` over `Players.GetChildren()`.
In roblox-ts, `Players.GetPlayers()` provides more accurate TypeScript typings for the returned array of `Player` objects. Using `Players.GetChildren()` returns an array of `Instance`, which would then require type casting or assertions to be used safely as `Player` objects. This rule helps prevent potential runtime errors and improves code clarity by ensuring the correct method is used.

## Examples

Examples of **incorrect** code for this rule:

```js
import { Players } from "@rbxts/services";
for (const player of Players.GetChildren()) { // ❌ player is typed as Instance
  // ...
}

const allPlayers = Players.GetChildren(); // ❌ allPlayers is typed as Instance[]

const y = game.GetService("Players");
for (const player of y.GetChildren()) { // ❌ only incorrect if validateType is true
  // ...
}

print(game.GetService("Players").GetChildren()); // ❌ only incorrect if validateType is true

function x(alias: Players) {
  for (const player of alias.GetChildren()) {
    // ...
  }
}
```

Examples of **correct** code for this rule:

```js
const players = Players.GetPlayers(); // ✅ players is typed as Player[]

for (const player of Players.GetPlayers()) { // ✅ player is typed as Player
  // ...
}

const children = Workspace.GetChildren(); // ✅  GetChildren() on other services or instances
print(players.GetChildren()); // 'players' is not the Players service

const y = game.GetService("Players");
for (const player of y.GetPlayers()) { // ✅ only correct if validateType is true
  // ...
}

const Players = Instance.new("Part");
print(Players.GetChildren()); // ✅ Only valid if validateType is false

function x(players: Omit<Players, "GetPlayers">) { // ✅ players has no GetPlayers method
  for (const player of players.GetChildren()) {
    // ...
  }
}
```

## Options

This rule has one option, `validateType`, which is a boolean.

-   `validateType` (default: `false`):
    -   When `false`, the rule only checks for direct calls on an identifier named `Players` (e.g., `Players.GetChildren()`).
    -   When `true`, the rule uses type information to check if the object calling `GetChildren()` is actually the `Players` service. This is useful if you have aliased the `Players` service to a different variable name (e.g., `const P = game.GetService("Players"); P.GetChildren();`) or if it's accessed through an interface. This option requires TypeScript type checking to be enabled in your ESLint configuration.

<!-- begin auto-generated rule options list -->

| Name           | Description                                                                      | Type    | Default |
| :------------- | :------------------------------------------------------------------------------- | :------ | :------ |
| `validateType` | Enable or disable type validation. Useful if your Players variable has an alias. | Boolean | `false` |

<!-- end auto-generated rule options list -->

Example configuration with options:

```json
{
	"roblox-ts/prefer-get-players": ["error", { "validateType": true }]
}
```
