# L07 — Registry and consumption outside the monorepo

Initial status: **planned**. Branch: `feat/shadcn-pdf-registry`.

Dependencies: L06. Requirements: FR-13, FR-14; NFR-03, NFR-06, NFR-08, NFR-09; G3.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/REGISTRY.md), [reference 2](../../adr/0004-source-distribution.md), [reference 3](../../TESTING.md).

## Scope and files

Prove distribution with existing cards before multiplying templates. The actual shadcn CLI is part of the evidence.

Target files/responsibilities: tooling/registry, tooling/assets, tests/consumers, source viewer, generated apps/www/public/r.

## Stories and commits in order

### L07-S01 — `feat(registry): generate versioned items from document sources`

- [x] Single source manifest, docn-* IDs, card items; pinned local official schema.
- [x] Build the dependency closure, target docn subdirectories, and rewrite imports with a bounded, tested transformation.
- [x] Validate cycles, paths, duplicates, private aliases, and missing sources; deterministic, ignored outputs.
- [x] Explicit development version; no supposedly reserved namespace/domain.

**Acceptance:** Every required file is included; no site/workspace import is distributed.

**Targeted verification:** Targeted graph/transformation unit tests; pnpm verify:registry. No snapshots of thousands of JSON lines.

### L07-S02 — `feat(registry): distribute verified local assets and usage examples`

- [ ] Choose a supported font installation mechanism; if a fetcher is needed, keep its code visible without automatic execution.
- [ ] Resolve destinations, hashes, licenses, and overwrite rejection; traversal/size-limit tests in the existing utility suite.
- [ ] Provide browser and Node examples with local AssetResolver and exact instructions.

**Acceptance:** After asset preparation, rendering requires no docn-ui domain; asset failures are explicit.

**Targeted verification:** pnpm verify:assets; targeted fetcher unit tests; no network downloads in unit tests.

### L07-S03 — `feat(code): expose complete source and installation instructions`

- [ ] Display the file list, highlighted code, and copy action from the same sources; fallback when the clipboard is unavailable.
- [ ] Actual command targeting the configured origin/version; local in development, public URL only after a decision.
- [ ] Document shadcn prerequisites, dependencies, assets, customization, and updates without automatic overwrite.

**Acceptance:** Users access complete source, not only page JSX; the local command is executable.

**Targeted verification:** Targeted source/copy component tests; verify the displayed source/manifest relationship.

### L07-S04 — `test(registry): install and render templates in isolated consumers`

- [ ] Activate test:consumers; run two temporary projects outside the workspace with the actual pinned CLI.
- [ ] Install a card and its dependency closure; run browser and Node rendering with local assets, then verify content/dimensions.
- [ ] Block the registry domain after installation and prove independence; retain sanitized logs and installation state.
- [ ] Add consumer-tests conditional on distribution changes and mandatory at gates; verify the all command without duplication.

**Acceptance:** G3: no hidden access to monorepo node_modules/aliases or the docn-ui domain after installation.

**Targeted verification:** pnpm test:consumers; pnpm verify:registry; inspect the consumer PDF. Do not separately install all three cards sharing the same graph.

## Exit criteria

Standalone distribution qualified. Every later template follows this contract; do not defer installation defects to release.

Update [status](../status.json) and create `docs/qa/L07.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No npm publication, proprietary CLI, official namespace, or automatic overwrite of user files.
