# L22 — Registry, consumers, migration and qualification

Initial status: **planned**. Proposed branch: `test/unified-api-distribution`.

Dependencies: L21. Requirements: FR-24, G7, NFR-06, NFR-08, NFR-09, NFR-11, NFR-12, NFR-13.

## Reading and entry criteria

Read the registry specification, update guide, release policy, L17–L21 evidence and actual public-version state. All migrated source must already exist. Resolve the target registry version and compatibility policy before generating public commands; do not infer publication permission.

## Scope and files

Make the unified API installable as source, replace low-level primary examples, qualify isolated Node/browser consumers, and document migration. Source-closure installation and binary-asset preparation are separate observed steps. Prepare versioned artifacts only for an explicitly authorized target; development paths remain development paths.

Target responsibilities: registry manifest/generation, consumer fixtures, source panels/docs, migration guide, QA and status.

## Stories and commits in order

### L22-S01 — `feat(registry): distribute unified template and render entries`

- [ ] Add explicit items for the template contract and platform render facades with bounded same-version dependencies.
- [ ] Keep individual components independent from the complete renderer and catalog.
- [ ] Validate source closures, target paths, manifests, licenses and absence of private aliases. The closure includes visible preparation tooling but does not claim fonts/images are already prepared.

**Acceptance:** Installing one migrated template plus the chosen platform facade yields a complete inspectable source closure without a hidden runtime package.

**Targeted verification:** Registry schema/graph/snapshot tests; no network install yet.

### L22-S02 — `refactor(examples): lead with one renderPdf workflow`

- [ ] Replace direct React PDF/font/format setup with `renderPdf(template, { data, theme?, format?, locale?, printProfile?, revision? }, runtimeOptions?)` in primary Node and browser examples.
- [ ] Keep low-level composition and plan APIs in a clearly labeled advanced guide.
- [ ] Show preset and custom `theme` use with structured result handling.

**Acceptance:** The documented first render requires template data and at most optional theme/runtime overrides.

**Targeted verification:** Compile snippets and documentation link checks.

### L22-S03 — `test(consumers): qualify isolated Node and browser installation`

- [ ] Install through the pinned official shadcn CLI in fresh custom-alias projects outside the monorepo.
- [ ] First verify source installation, then separately run and verify local binary-asset preparation; report each outcome independently.
- [ ] Render one fixed template, the existing `ComponentDocument` flow specimen and one continuous template without the registry origin at runtime.
- [ ] Transfer document images only through the bounded local-image runtime/worker channel; never place URLs or paths in template data.
- [ ] Confirm strict TypeScript, no configuration replacement, no private dependency and browser same-origin network behavior.

**Acceptance:** Both environments render through the public installed facade and preserve their existing `components.json`.

**Targeted verification:** One Node fixture and one Vite/Chromium fixture, sampling distinct closures rather than reinstalling all 18 templates.

### L22-S04 — `docs(migration): document unified API adoption and compatibility`

- [ ] Map flattened props, `style`, manual font setup, direct engine calls and plan functions to the new API.
- [ ] State the legacy-wrapper window and all major-version removals without promising automatic source updates.
- [ ] Document Theme Studio code use, qualified defaults, assets, errors and advanced escape hatches.
- [ ] Compile and import a generated `~/docn/themes/<safe-name>.ts` module with its relative `./themes` import in the isolated consumer; do not evaluate source at runtime.

**Acceptance:** A current consumer can migrate deliberately without losing owned edits or being told to overwrite files.

**Targeted verification:** Procedure review against both isolated fixtures; no application suite for prose alone.

### L22-S05 — `test(release): qualify the post-v1 integration candidate`

- [ ] Run the proportionate final checks, build the static site and inspect affected routes/source artifacts.
- [ ] Reconcile requirements, QA, registry versions, dependency impact and known limitations.
- [ ] Record the candidate SHA and actual state. Create PRs, merge, deploy, tag or publish only when separately authorized and observed.

**Acceptance:** G7 evidence is complete locally or remotely as actually performed; no mutable development URL is presented as an immutable release.

**Targeted verification:** `pnpm validate`, build, docs verification, affected PDF suites, isolated consumers and focused Theme Studio E2E. Reuse L20 visual evidence and do not rerun a combinatorial catalog matrix.

## Exit criteria

The source-owned unified API is documented, installable and externally qualified. `verified_local`, `merged`, deployed and publicly released remain distinct states.

Update status and `docs/qa/L22.md`. If publication or merge is not authorized, stop at the truthful local state and report the exact next decision.

## Out of scope

No automatic merge, deployment, tag, npm publication, official registry submission, domain purchase, source overwrite, hosted rendering API or proprietary installer.
