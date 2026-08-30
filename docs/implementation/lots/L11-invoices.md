# L11 — Multipage invoices and complete catalog

Initial status: **planned**. Branch: `feat/invoice-templates`.

Dependencies: L10. Requirements: FR-01, FR-12, FR-13, FR-16; NFR-05; G4.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/DOCUMENT_MODEL.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../TESTING.md).

## Scope and files

Three invoices with actual pagination and shared receipt calculations. Reach fifteen compositions without expanding into accounting software.

Target files/responsibilities: packages/documents/src/primitives/table, templates/invoices, line-item form, and registry.

## Stories and commits in order

### L11-S01 — `feat(invoices): add invoice schema and multipage table primitives`

- [x] Reuse money and its tests; add seller/customer/number/dates/lines and bounded text fields.
- [x] Flowing PDF tables, repeated headers, footer margins; split tall rows according to the contract or return an explicit error.
- [x] Keep totals/signatures together where possible; extract text from every page.

**Acceptance:** A long invoice does not overlap its footer or lose any line or total.

**Targeted verification:** Extend the existing pagination PDF suite; add a specific contract unit test if needed, without copying money tests.

### L11-S02 — `feat(invoices): add minimal business and studio layouts`

- [x] Implement three compositions with A4/Letter, themes, and optional contact details.
- [x] Preserve the maintainer-approved preview/copy/source catalog surface without restoring the removed line-item customization form.
- [x] Metadata, catalog, thumbnails, source, registry, and descriptions of visual differences.

**Acceptance:** Fifteen compositions advertised and actually available; each invoice has its data and complete rendering.

**Targeted verification:** Nominal examples in the invoice PDF suite and contact-sheet review.

### L11-S03 — `test(invoices): verify long-table export and summary placement`

- [x] One representative multipage fixture with a long label, continuity checks, and correct total.
- [x] Add an invoice catalog/source E2E journey without restoring the maintainer-rejected public editor or download control.
- [x] Verify line-count limits or overly long fields at the appropriate level.

**Acceptance:** Final export contains first/last lines, number, and total; no blank page or unreadably split block.

**Targeted verification:** pnpm test:pdf invoice; pnpm test:e2e invoice.spec.ts; selected multipage invoice visual reference.

### L11-S04 — `docs(catalog): document the complete v1 template inventory`

- [x] Verify the inventory of fifteen unique IDs with associated metadata/fixtures/source/registry.
- [x] Add calculation/tax warnings and format limits without claiming jurisdictional compliance.
- [x] Complete G4 with validate:full for activated scopes; install new dependency graphs if distribution changed and record evidence.

**Acceptance:** G4: complete V1 catalog; each family requirement is traceable; no future-template promises in navigation.

**Targeted verification:** pnpm validate:full; inventory and contact-sheet review. Do not repeat this gate validation after every label correction.

## Exit criteria

Fifteen compositions across five families. G4 verified with code/source/exports and limitations.

Update [status](../status.json) and create `docs/qa/L11.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No credit notes, compound taxes, fractional quantities, certified electronic invoicing, or bookkeeping.
