# Contributor Manual

Thanks for your interest in contributing to @xivapi org! We welcome contributions of all kinds, including bug fixes, new features, and documentation improvements.

## Local Setup

Before making changes, ensure your environment is configured:

1. **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/en/download) (latest LTS) installed.
   > **Note:** [pnpm](https://pnpm.io/) is strongly recommended for its package caching, though other package managers can be used.
2. **Install Dependencies:**

   ```bash
   pnpm install
   ```

3. **Lockfile Policy:** If your chosen package manager creates a lockfile that is not already tracked, please add it to `.gitignore` before submitting your changes.

## How to Contribute

1. **Fork** the repository.
2. **Create a feature branch**, for example:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes, following the style and structure of the project or package you are modifying.
4. **Add a changeset** if your changes affect package users (bug fixes, features, or updates):

   ```bash
   pnpm exec changeset
   ```

   Follow the prompts to select a semver bump (`patch` or `minor`) and enter a summary for `CHANGELOG.md`. Documentation-only changes do not require a changeset.

5. Add tests or verify that your changes work as expected.
6. Commit your work using clear, descriptive commit messages, including the generated `.changeset/*.md` file.
7. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

8. Open a Pull Request against the default branch (for example, `main` or `master`). If a PR template is provided in the repository, please follow it when submitting your Pull Request. In general, your PR description should include:
   - What you changed
   - Why you changed it
   - Any related issues or @xivapi context

## Reporting Issues

Before opening a new issue:

- Check existing issues to avoid duplicates.
- Provide a clear description of the problem or feature request.
- For bugs, include steps to reproduce, expected vs. actual behaviour, and any relevant logs, screenshots, or API responses.
- For feature requests, explain the problem the feature solves and any alternatives you have considered.

## Code Style & Tests

- Follow the existing coding conventions (formatting, naming, structure, and organisational patterns).
- Update or add tests when appropriate.
- Ensure all tests pass before submitting your PR:

  ```bash
  pnpm test
  ```

- Keep changes focused-smaller, well-scoped PRs are easier to review and merge.
