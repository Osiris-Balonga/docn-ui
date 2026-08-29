# L05 — Business cards from editing to export

Initial status: **planned**. Branch: `feat/business-card-templates`.

Dependencies: L04. Requirements: FR-02, FR-04–FR-08; NFR-04, NFR-05; G2.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/TEMPLATE_CATALOG.md), [reference 2](../../specs/DOCUMENT_MODEL.md), [reference 3](../../../DESIGN.md), [reference 4](../../TESTING.md).

## Scope and files

First complete workflow with business-card-minimal, then two additional compositions. Validate the product before generalizing the gallery.

Target files/responsibilities: packages/documents/src/templates/business-cards, apps/www/src/features/playground and pdf-viewer, template route.

## Stories and commits in order

### L05-S01 — `feat(cards): add typed two-sided minimal business card`

- [x] Create the card schema, synthetic French/English data, metadata, and declared formats; compose minimal front/back.
- [x] Respect safe areas, optional contact details, and side order; report names or addresses that do not fit.
- [x] One family PDF suite contains the nominal case and overflow risk; measure both sides.

**Acceptance:** The minimal PDF has two correctly sized pages, preserves contact details, and has no site dependency.

**Targeted verification:** pnpm test:pdf business-card; review both sides.

### L05-S02 — `feat(playground): edit card data and preview the actual PDF`

- [x] Create the card detail page and form with shadcn, field-level validation, and reset to sample data.
- [x] Connect the worker/data revision, format/theme selection, and page/zoom viewer; explicit stale/error states.
- [x] Download the same final result; use a neutral, safe filename without unnecessary personal data.
- [x] Activate `test:e2e` and Playwright Chromium configuration with the first real journey: isolated build server, one worker, retries 0, ignored artifacts. Add this scope to `test:all` without including it in lightweight tests.

**Acceptance:** Changing the name updates the PDF; the back and export match the latest valid revision.

**Targeted verification:** Form component tests with a simulated renderer; one real browser edit→back→export journey.

### L05-S03 — `feat(cards): add editorial and studio compositions`

- [x] Add the two planned distinct structures, sharing family schema and helpers.
- [x] Declare actually supported formats; test size changes at boundaries without combining all themes/languages.
- [x] Generate thumbnails from PDFs; review the three compositions and their backs together.

**Acceptance:** Three structurally different compositions; every advertised size remains readable.

**Targeted verification:** Extend the same PDF suite with two nominal examples; contact sheet and smallest-format case.

### L05-S04 — `test(cards): verify faithful export and fixed-layout recovery`

- [x] Consolidate the real journey with invalid input, correction, reset, and format changes.
- [x] Verify downloaded content and dimensions, not only the download event; check preview-revision fingerprint/bytes.
- [x] Remove obsolete spike screens; record G2 QA and physical limitations.

**Acceptance:** G2: an unaided user creates a customized card and obtains a correct PDF; no advertised functionality is simulated.

**Targeted verification:** pnpm validate; pnpm test:pdf business-card; targeted card E2E and visual review. No copied E2E for each composition.

## Exit criteria

G2 reached; first complete experience and three cards ready for catalog/registry.

Update [status](../status.json) and create `docs/qa/L05.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No substitute HTML rendering, executable code editor, or general catalog before this evidence.
