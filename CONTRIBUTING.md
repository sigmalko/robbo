# Contributing

Run commands from the repository root using the Node version in `package.json`.
See [README](README.md) for setup and verification.

- Use kebab-case for files/directories, PascalCase for TypeScript types/classes,
  camelCase for values/functions and UPPER_SNAKE_CASE for protocol constants.
- Keep one npm package. Use relative imports and the boundaries described in
  [architecture](docs/architecture.md). Active TypeScript is checked in strict mode.
- Put unit tests under `tests/unit/<area>`, cross-module scenarios under
  `tests/integration`, shared builders in `tests/fixtures`, browser scripts under
  `tests/browser`, and Node tooling tests under `tests/tooling`.
- Node tools use explicit `.cjs` imports. Preserve public npm command names when
  reorganizing tools, and update direct workflow invocations too.
- Change generated campaign data through the importer and canonical manifest;
  regenerate with `npm run import:levels`. Do not rewrite historical DAT files.
- Keep gameplay rules, replay identifiers and storage keys stable during structural
  changes. Intentional compatibility changes require a migration and regression tests.
- Explain the problem, resulting behavior and verification in each PR. Keep
  mechanical moves separate from changes to gameplay. Use Git history to recover
  retired implementations instead of adding another copy to the source tree.

Review areas are rules/replay, interface/accessibility, data/artwork and
tooling/releases. These are responsibilities, not separate required teams.
Assign real maintainers before introducing CODEOWNERS. Rule changes need replay
validation; packaging changes need offline and HTTP browser checks. CI validates
the PR release; production Pages deployment occurs only after merging to main.
