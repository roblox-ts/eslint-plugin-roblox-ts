# Enforce use of task library alternatives

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->
<!-- Do not manually modify this header. Run: `npm run eslint-docs` -->

## Rule Details

This rule reports and autofixes usage of the global `wait()`, `delay()`, and
`spawn()` functions, replacing them with their `task` library equivalents due to
the former being deprecated.

### ❌ Incorrect

```lua
wait()
delay(() => {})
spawn(() => {})
```

### ✅ Correct

```lua
task.wait()
task.delay(() => {})
task.spawn(() => {})
```
