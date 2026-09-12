# L19 — Component prerequisites for template migration

Initial status: **planned**. Proposed branch: `feat/template-component-prerequisites`.

Dependencies: L18. Requirements: FR-21, NFR-13.

## Reading and entry criteria

Read the component catalog, template catalog, table/flow contracts, graph contracts, L18 evidence and the template audit. The facade must already render representative plans; this lot changes reusable components, not templates.

## Scope and files

Close only the shared capability gaps that otherwise force migrated templates to rebuild tables, comparison charts or basic document structures. Tables receive a bounded non-flow contract; Graph receives grouped multi-series bars; a separate audit either qualifies the remaining minimal composition components or reduces the L20 mapping promises before migration. Preserve individual registry installation and existing behavior.

Target responsibilities: table and Graph primitives/data/geometry, examples, component registry metadata, focused PDF and consumer tests.

## Stories and commits in order

### L19-S01 — `feat(table): support fixed and continuous frame composition`

- [ ] Separate core table composition from optional flow pagination context and require an explicit numeric container width in points for fixed/continuous mode.
- [ ] Define bounded minimum/maximum row height, cell line/count limits and deterministic overflow behavior; never silently paginate inside `PageFrame` or truncate a receipt.
- [ ] Add a qualified compact density, alternating bands and header/total/column emphasis without template-specific CSS-like selectors.
- [ ] Validate column widths against the container and keep cell contents to printable bounded values.
- [ ] Preserve existing `Table` and `DataTable` flow behavior and types.

**Acceptance:** An invoice page and receipt can use public table components without a `DocumentFrame` provider or private table clone.

**Targeted verification:** Table unit tests plus one fixed and one continuous PDF fixture, including one overflow error.

### L19-S02 — `feat(graph): add bounded grouped multi-series bars`

- [ ] Add grouped bars with bounded series identifiers, labels, values, legend semantics and deterministic color assignment from validated PDF colors.
- [ ] Support at least 6 series × 30 points within declared geometry budgets and reject larger inputs explicitly.
- [ ] Accept trusted composition-owned axis/category/value formatter functions; formatter functions never enter serialized user data or worker messages.
- [ ] Preserve single-series cartesian and radial APIs through compatible normalization.
- [ ] Keep text selectable and labels visible without DOM or canvas.

**Acceptance:** The audited report comparison charts are expressible through public Graph data without raw chart geometry in the template.

**Targeted verification:** Graph data/geometry units at 1, typical and 6 × 30 bounds; grouped-bar PDF text/visual check and formatter behavior.

### L19-S03 — `test(components): qualify minimum template composition capabilities`

- [ ] Exercise the template matrix against `PageHeader`, `PageFooter`, `Section`, `KeyValue`, `List`, `Badge`, `Card`, `Signature`, `Image`, `QRCode`, `Barcode`, Table and Graph in their required frame modes.
- [ ] Add only the smallest compatibility changes needed for a real migrated use case.
- [ ] If a public component cannot meet the audited composition without a disproportionate abstraction, reduce the L20/TEMPLATE_CATALOG mapping promise and record the template-local exception instead.

**Acceptance:** Every component promised by the migration matrix has one qualified representative composition, or the promise is narrowed before template work starts.

**Targeted verification:** Focused component/type fixtures and at most one representative PDF per newly changed shared behavior; reuse existing component tests.

### L19-S04 — `docs(components): document frame modes and multi-series graphs`

- [ ] Update component pages, source examples, limitations and migration notes.
- [ ] Explain which table mode owns pagination and which rejects overflow.
- [ ] Document explicit width/height/density/banding/emphasis/cell bounds and the 6 × 30 Graph budget with trusted formatters.
- [ ] Show a multi-series example without implying arbitrary dashboard support.

**Acceptance:** Examples compile against public component entry points and describe bounded behavior accurately.

**Targeted verification:** Documentation/source-example checks; no site-wide screenshot matrix.

### L19-S05 — `test(registry): preserve individual component installation`

- [ ] Update registry dependencies without pulling the unified renderer into standalone Table or Graph installation.
- [ ] Install the affected items in the existing custom-alias consumer fixture.
- [ ] Record exact dependency and bundle impact in QA evidence.

**Acceptance:** Table and Graph remain individually source-installable, strict-TypeScript clean and free of private aliases.

**Targeted verification:** Registry graph/static checks and one sampled external consumer build/render.

## Exit criteria

The two audited shared gaps are closed and qualified before any template family depends on them. No unrelated component expansion is included.

Update status and `docs/qa/L19.md`. Merge and publication remain separate maintainer decisions.

## Out of scope

No spreadsheet engine, arbitrary chart grammar, interactive PDF table, template migration or visual redesign.
