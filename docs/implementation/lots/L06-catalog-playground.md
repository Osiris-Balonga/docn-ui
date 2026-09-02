# L06 — Catalog and reusable editor

Initial status: **planned**. Branch: `feat/catalog-and-playground`.

Dependencies: L05. Requirements: FR-01, FR-02, FR-04–FR-07; NFR-01, NFR-04, NFR-07.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../../DESIGN.md), [reference 2](../../specs/DOCUMENT_MODEL.md), [reference 3](../../TESTING.md).

## Scope and files

Generalize the card experience for later families without creating a layout editor or fully generic form system.

Target files/responsibilities: apps/www/src/features/catalog, playground, pdf-viewer, template routes; document metadata.

## Stories and commits in order

### L06-S01 — `feat(catalog): add searchable format-aware template gallery`

- [x] Create a lightweight metadata catalog, gallery with actual thumbnails, search, and combinable filters.
- [x] Synchronize only public filters to the URL; count, empty state, clearing, and back navigation.
- [x] Pregenerate known routes and 404; load engines/templates on demand, never for every thumbnail.

**Acceptance:** The gallery shows only the three available cards at this stage; filters work without importing the engine.

**Targeted verification:** Targeted filter unit tests and one catalog journey; no test for every static string.

### L06-S02 — `feat(playground): add validated data theme and format controls`

- [x] Separate the reusable shell from explicit family forms; serializable metadata and a form registry without universal Zod introspection.
- [x] Add bounded advanced JSON text, validation before applying, and return to the form; no code evaluation.
- [x] Add accent/locale/print-profile controls and reset; retain the last valid preview marked outdated during errors.
- [x] Any parameter change invalidates the exportable revision; never put JSON/logos in URLs or storage.

**Acceptance:** Form and JSON states/actions remain consistent without silent data loss.

**Targeted verification:** Editor component tests and coordination integration; reuse existing schema unit tests.

### L06-S03 — `feat(playground): handle safe image uploads and render lifecycle`

- [x] Bounded local PNG/JPEG imports, actual decoding/dimensions, normalized orientation, EXIF removal; local removal available.
- [x] Active/pending latest-wins queue, timeout, worker termination, cleanup of buffers/Object URLs and PDF.js tasks.
- [x] Sanitized generic errors; controlled recovery and disabled download when the revision is invalid or stale.

**Acceptance:** Rejected files have explanations; rapid edits cannot produce stale exports; navigation leaves no active worker.

**Targeted verification:** Shared image-validation unit tests and latest-wins/cleanup integration; one real failure/recovery scenario, not one E2E per MIME type.

### L06-S04 — `test(playground): verify export privacy and stale-result protection`

- [x] Extend card E2E to verify the latest revision export and no requests containing data/images.
- [x] Targeted negative test for user asset URLs; memory-only data.
- [x] Activate e2e-chromium and its artifacts without rerunning all lightweight suites; document real/mock boundaries.

**Acceptance:** The nominal journey uses actual workers and PDFs; entered data is never transmitted to the site or a third party.

**Targeted verification:** pnpm validate; pnpm test:e2e playground.spec.ts; reuse one build.

## Exit criteria

Catalog and editor shell extend through metadata and family forms. No coupling between UI and exportable PDF source.

Update [status](../status.json) and create `docs/qa/L06.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No document-data URL sharing, cloud history, freeform drag-and-drop, or JSX import.
