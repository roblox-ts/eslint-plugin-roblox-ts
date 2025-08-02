# Contributing to eslint-plugin-roblox-ts

First off, thank you for considering contributing to `eslint-plugin-roblox-ts`!

## Getting Started

1.  **Fork the repository:** Click the "Fork" button on the top right of the [repository page](https://github.com/roblox-ts/eslint-plugin-roblox-ts).
2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/eslint-plugin-roblox-ts.git
    cd eslint-plugin-roblox-ts
    ```
3.  **Install dependencies:** This project uses `pnpm` for package management.
    ```bash
    pnpm install
    ```
4.  **Build the project:**
    ```bash
    pnpm build
    ```

## Making Changes

1.  **Create a branch:** Create a new branch for your changes.
    ```bash
    git checkout -b my-feature-branch
    ```
2.  **Make your changes:** Implement your feature or fix the bug.
3.  **Ensure code style:** This project uses ESLint and Prettier for code formatting and linting. Run the linters before committing:
    ```bash
    pnpm lint --fix
    ```
    Commits are automatically linted using `lint-staged` and `simple-git-hooks`.
4.  **Run tests:** Make sure all tests pass.
    ```bash
    pnpm test
    ```
5.  **Commit your changes:** Use clear and concise commit messages.
    ```bash
    git add .
    git commit -m "feat: add my-new-rule`"
    ```
6.  **Push to your fork:**
    ```bash
    git push origin my-feature-branch
    ```
7.  **Open a Pull Request:** Go to the original repository on GitHub and open a pull request from your fork's branch to the `main` branch of the original repository. Provide a clear description of your changes.

## Adding a New Rule

If you are adding a new ESLint rule:

1.  **Scaffold the rule:** Use the `create-rule` script to generate the necessary files and update `src/index.ts`. Replace `your-rule-name` with the desired name for your rule (e.g., `my-new-rule`).
    ```bash
    npx tsx scripts/create-rule.ts your-rule-name
    ```
    This will:
    *   Create a new directory for your rule under `src/rules/your-rule-name/`.
    *   Generate `rule.ts`, `rule.spec.ts`, and `documentation.md` in the new directory based on the templates.
    *   Automatically add the new rule to the `rules` export in `src/index.ts`.

2.  **Implement the rule logic:** Open `src/rules/your-rule-name/rule.ts` and implement the core logic for your ESLint rule.
3.  **Write tests:** Open `src/rules/your-rule-name/rule.spec.ts` and write comprehensive tests for your rule using `vitest`. Ensure good test coverage for various valid and invalid code scenarios.
4.  **Document the rule:** Open `src/rules/your-rule-name/documentation.md` and provide clear documentation. Include:
    *   A concise description of what the rule does.
    *   Examples of incorrect code that the rule will flag.
    *   Examples of correct code that adheres to the rule.
    *   Any options the rule supports.
5.  **Update the README:** After implementing and documenting your rule, update the main `README.md` rules table by running:
    ```bash
    pnpm eslint-docs
    ```
6.  **Test and lint:** Ensure all tests pass and that there are no linting errors:
    ```bash
    pnpm test
    pnpm lint --fix
    ```
7.  **Consider recommending the rule:** If your rule is generally applicable and enforces a best practice, consider adding it to the `recommended` configuration within `src/index.ts`.

## Reporting Bugs

If you find a bug, please open an issue on the [GitHub Issues page](https://github.com/roblox-ts/eslint-plugin-roblox-ts/issues). Include:

*   A clear and descriptive title.
*   Steps to reproduce the bug.
*   The expected behavior.
*   The actual behavior.
*   Relevant code snippets.
*   Your environment details (Node.js version, ESLint version, plugin version).

## Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please open an issue on the [GitHub Issues page](https://github.com/roblox-ts/eslint-plugin-roblox-ts/issues). Describe your suggestion clearly and explain why it would be beneficial.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE.md) that covers the project.
