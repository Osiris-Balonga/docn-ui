# Contributing to docn-ui

This project is being implemented from a versioned plan. Read [AGENTS.md](AGENTS.md), [the plan](IMPLEMENTATION_PLAN.md), the current lot and its GitHub issue before making changes. The code license has not yet been selected; do not assume a redistribution license from the repository's public visibility.

## Language

Use English for all project content: documentation, plans, code comments, UI copy, commits, issues, pull requests, milestones, and QA evidence. Preserve stable identifiers and history. This does not remove the planned French/English locale support for user document data.

## Branches and pull requests

Start a working branch from `dev` using the branch name in the lot. Supported prefixes: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `ci/`, `build/`, `refactor/`, `release/`. Working branches target `dev`; only `dev` **from this repository** targets `main`. There is no direct hotfix exception. Same-repository `main -> dev` PRs may synchronize promotions.

Both branches require PRs and the `branch-policy` check. No direct pushes, force pushes, deletions or bypasses. Keep the planned atomic commits and use merge commits, never squash. Merges require maintainer authorization; no auto-merge. Additional CI checks become required when their actual suites are introduced.

## Template contributions

Read the public [Creating templates](apps/www/src/content/docs/guide-content.ts) guide before changing a composition. It defines the required schema, metadata, fixture, registry, generated preview, licensing, review, compatibility and versioning workflow.

A template must remain one source of truth. The catalog, gallery preview, PDF export and registry derive from its registered `TemplateDefinition`. A new composition in an existing family must not require playground-core changes or a copied family implementation.

### Template pull request checklist

- Use English for source, documentation, UI copy, comments, commits, issues and pull requests.
- Preserve existing work and keep each commit to one coherent, tested intention.
- State asset provenance and redistribution terms. Do not submit copied brands or unlicensed assets.
- Describe supported formats, data/API changes, version changes, visual evidence, focused tests and known limitations.
- Complete the repository pull request checklist. Never weaken checks or regenerate references only to make CI pass.

## Verification without redundant tests

Use the lowest sufficient scope from [TESTING](docs/TESTING.md). Documentation changes need link/consistency checks and `git diff --check`, not PDF or browser suites. For branch policy changes run:

```text
node --test tooling/github/branch-policy.test.mjs
```

For a template contribution, run the lowest sufficient targeted test during development. Before review, run:

```sh
corepack pnpm validate
corepack pnpm build
corepack pnpm verify:docs
```

When PDF source, geometry, data rendering or assets change, also run the affected PDF test named by the lot or test plan. Documentation-only changes do not require the full PDF suite.

## Issue and Project tracking

One issue tracks each lot, with stories as checkboxes. Read it before work, move its single Project Status as work progresses, and link real commits and QA evidence. Use `Closes #N` in a completed lot PR to `dev`; for L16 use `Refs #N` until the public release is verified. An open PR is In review, not Done. Never overwrite human notes or create duplicate issues. See [GITHUB](docs/GITHUB.md) and the [ID mapping](docs/implementation/github.json).
