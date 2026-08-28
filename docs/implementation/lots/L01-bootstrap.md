# L01 — Reproducible bootstrap and quality scopes

Initial status: **planned**. Branch: `chore/bootstrap-workspace`.

Dependencies: L00G. Requirements: NFR-02, NFR-03, NFR-06, NFR-08.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../ARCHITECTURE.md), [reference 2](../../TESTING.md), [reference 3](../../adr/0001-stack.md).

## Scope and files

Two workspaces and a minimal page, without a PDF engine or fake catalog. Establish separate test commands now.

Target files/responsibilities: package.json, pnpm-workspace.yaml, pnpm-lock.yaml, apps/www, packages/documents, TS/Vitest configuration, .github/workflows/ci.yml.

## Stories and commits in order

### L01-S01 — `chore(workspace): scaffold static Next.js and document sources`

- [x] Resolve compatible stable Node/pnpm/React/Next/TS versions and record the actual table in docs/DEPENDENCIES.md; set packageManager, engines, and exact versions.
- [x] Create apps/www with Next App Router/static export and private packages/documents; strict TS, clean aliases, cross-platform pnpm scripts, no Unix shell requirement on Windows.
- [x] Remove scaffold demos; provide an honest minimal page, 404, and title; generate an export served by a static server.

**Acceptance:** Frozen-lockfile installation, typechecking, and reproducible build. No runtime server import required.

**Targeted verification:** pnpm install --frozen-lockfile; pnpm typecheck; pnpm build; local HTTP page inspection.

### L01-S02 — `chore(ui): initialize shadcn with Base UI and Tailwind`

- [x] Inspect exact CLI version options; noninteractive init with Base UI, aliases, and CSS variables.
- [x] Install only Button and Tooltip needed for the screen smoke check; commit sources and components.json; do not rerun init with --force.
- [x] Verify compilation, base theme, and local site fonts; distinguish web and PDF fonts.

**Acceptance:** The visible button comes from shadcn sources and works in the static build.

**Targeted verification:** Targeted build and simple visual inspection. No tests repeating shadcn's internal variants.

### L01-S03 — `chore(testing): separate unit component and integration scopes`

- [ ] Configure Vitest unit/components/integration with exclusive globs and appropriate environments; reserve pdf/consumers conventions without fake successful empty suites.
- [ ] Provide TESTING scripts: test, watch, coverage, validate, formatting/lint/types. Prepare an orchestrator that collects only actually activated scopes and documents them.
- [ ] Create a UI composition smoke check and a test only where custom behavior exists; do not generate tests for every configuration file.
- [ ] Limit workers, ignore .artifacts, and use test listings to verify each file is collected exactly once.

**Acceptance:** test:unit starts neither DOM nor browser; test:components renders no PDF; activated scopes are explicit.

**Targeted verification:** pnpm validate; Vitest listings per project and exclusion checks. No arbitrary coverage threshold.

### L01-S04 — `ci: add focused quality and build checks`

- [ ] Add quality, unit-tests (three lightweight projects in one pass), and build; verified actions, read permissions, PR concurrency.
- [ ] Extend the L00G PR template with newly available commands; retain issue, risk, and evidence. Do not recreate the Project or branch policy.
- [ ] After a real CI run, add quality/unit-tests/build to both branches' required checks, retaining branch-policy; read active rules and record them in github.json. No push/deployment workflow.

**Acceptance:** Readable workflow, passing local commands and actual CI; new required checks verified on the lot PR. Unavailable GitHub prevents claiming completion.

**Targeted verification:** pnpm validate; pnpm build. Reuse results from the same SHA instead of running each scope twice.

## Exit criteria

Clean workspace and build; published command contracts; no PDF lot depends on a fake test.

Update [status](../status.json) and create `docs/qa/L01.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No hosting plugin, CMS, authentication, database, Turborepo, or proprietary CLI.
