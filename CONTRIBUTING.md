# Contributing to docn-ui

This project is being implemented from a versioned plan. Read [AGENTS.md](AGENTS.md), [the plan](IMPLEMENTATION_PLAN.md), the current lot and its GitHub issue before making changes. The code license has not yet been selected; do not assume a redistribution license from the repository's public visibility.

## Branches and pull requests

Start a working branch from `dev` using the branch name in the lot. Supported prefixes: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `ci/`, `build/`, `refactor/`, `release/`. Working branches target `dev`; only `dev` **from this repository** targets `main`. There is no direct hotfix exception. Same-repository `main -> dev` PRs may synchronize promotions.

Both branches require PRs and the `branch-policy` check. No direct pushes, force pushes, deletions or bypasses. Keep the planned atomic commits and use merge commits, never squash. Merges require maintainer authorization; no auto-merge. Additional CI checks become required when their actual suites are introduced.

## Verification without redundant tests

Use the lowest sufficient scope from [TESTING](docs/TESTING.md). Documentation changes need link/consistency checks and `git diff --check`, not PDF or browser suites. For branch policy changes run:

```text
node --test tooling/github/branch-policy.test.mjs
```

Application commands such as `pnpm validate`, `test:pdf` and `test:e2e` are introduced in their planned lots. They are not available merely because a document mentions them. Never claim an unexecuted check passed.

## Issue and Project tracking

One issue tracks each lot, with stories as checkboxes. Read it before work, move its single Project Status as work progresses, and link real commits and QA evidence. Use `Closes #N` in a completed lot PR to `dev`; for L16 use `Refs #N` until the public release is verified. An open PR is In review, not Done. Never overwrite human notes or create duplicate issues. See [GITHUB](docs/GITHUB.md) and the [ID mapping](docs/implementation/github.json).
