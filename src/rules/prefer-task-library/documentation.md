# Enforces use of task.wait(), task.delay(), and task.spawn() instead of global wait(), delay(), and spawn()

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
delay(function() end)
spawn(function() end)
```

### ✅ Correct

```lua
task.wait()
task.delay(function() end)
task.spawn(function() end)
```
