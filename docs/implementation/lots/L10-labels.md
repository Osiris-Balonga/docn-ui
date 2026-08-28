# L10 — Individual labels and sheets

Initial status: **planned**. Branch: `feat/label-templates`.

Dependencies: L09. Requirements: FR-11, FR-13, FR-16; NFR-05.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/DOCUMENT_MODEL.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../TESTING.md).

## Scope and files

Three compositions with individual or configurable sheet export, without claiming an untested commercial paper reference.

Target files/responsibilities: packages/documents/src/core/imposition, templates/labels, form, and sheet controls.

## Stories and commits in order

### L10-S01 — `feat(labels): define bounded sheet geometry and placement`

- [ ] Pure functions for dimensions/margins/gaps/cells, possible row/column counts, and row-major placement.
- [ ] First-page starting cell, quantity, subsequent pages; reject impossible formats, negative margins, and overflow.
- [ ] Label schema, individual/sheet profile, and bounded custom dimensions.

**Acceptance:** Every rectangle stays within the page; each data item occupies exactly one expected cell.

**Targeted verification:** Imposition unit tests: first/last cell, page transition, impossible geometry. Not one test per millimeter combination.

### L10-S02 — `feat(labels): add product address and inventory layouts`

- [ ] Compose three size-appropriate layouts; reuse QR with its density constraint.
- [ ] Add individual rendering, then sheets with ordered IDs; avoid duplicating template logic.
- [ ] UI controls for dimensions, sheet/individual mode, quantity, starting cell; metadata, thumbnails, registry.

**Acceptance:** Switching export modes preserves data and produces expected dimensions/page counts.

**Targeted verification:** Family PDF suite: three individual examples and one sheet spanning two pages; inspect text and coordinates.

### L10-S03 — `test(labels): qualify sheet alignment and partial-sheet export`

- [ ] Compare actual PDF placement with independently expected coordinates; verify no skipped or duplicated data.
- [ ] Create a sheet visual reference if it covers structure absent from individual labels.
- [ ] Document test sheets, 100% scale, hardware margins, and lack of Avery certification.

**Acceptance:** A sheet starting partway through and continuing on the next page is correct; printing limits are displayed.

**Targeted verification:** pnpm test:pdf label; pnpm test:unit imposition; pnpm verify:registry. No E2E per cell.

## Exit criteria

Twelve compositions in total; isolated, tested imposition usable without the site.

Update [status](../status.json) and create `docs/qa/L10.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No printer driver, universal duplex imposition, or assumed commercial compatibility.
