# L12 — Documentation, components, formats, and themes

Status: **in progress**. Branch: `feat/documentation-catalog`, based on merged L11 commit `a342433e0902935a454d8ef04a85cb508a765f4a`. The maintainer authorized PR #31's merge and L12 implementation on 2026-08-31.

Dependencies: L11. Requirements: FR-02, FR-13, FR-15, FR-16, FR-17.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode; connected implementation begins only after its authorized merge. References: [design](../../../DESIGN.md), [registry](../../specs/REGISTRY.md), [document model](../../specs/DOCUMENT_MODEL.md), [testing](../../TESTING.md), and the [component inventory and PDFx comparison](../../specs/COMPONENT_CATALOG.md).

## Scope and files

Make PDF components genuinely discoverable, reusable and individually installable. Maintainer revision, 2026-08-31: pause further template redesign, cover the 24 component categories in PDFx, and add barcodes. This explicitly supersedes the original documentation-only restriction. Keep the shadcn-compatible distribution and existing document contracts; do not introduce PDFx's separate CLI or project configuration. Write all documentation in English.

Target files/responsibilities: packages/documents/src/primitives and shared theme context, component examples, tooling/registry, apps/www/src/content/docs, features/docs, components/formats/themes routes, metadata, and search. New encoder/decoder dependencies require license and bundle review before installation.

L12-S02 is split into S02a–S02h because the new request introduces real PDF behavior, distribution changes and documentation, not just pages. Keep S01 and S03 stable; complete the following stories sequentially. No component is advertised until its source, installation, PDF example and detail page work.

## Stories and commits in order

### L12-S01 — `feat(docs): document installation and independent PDF usage`

- [x] Guides for installation, local assets, browser/Node, themes, formats, data/locale, and updating owned source.
- [x] Import examples from verified consumer fixtures; avoid a second manually maintained example implementation.
- [x] Limitation pages: fonts/scripts, printing, accessible PDFs, unsecured QR, uncertified invoices.
- [x] Distinguish existing shadcn configuration reuse from explicit PDF-safe theme/font mapping; do not promise automatic CSS or arbitrary-font inheritance.
- [x] Trusted, versioned local content only; never interpret user content as MDX. S01 uses typed static content compiled with Next.js, avoiding an unnecessary MDX parser dependency. A future MDX migration must retain this trust boundary.

**Acceptance:** A developer can follow prerequisites without monorepo knowledge and understand limitations before exporting.

**Targeted verification:** Documentation build and link checks; reuse consumer evidence instead of independently rerunning every snippet.

### L12-S02a — `refactor(pdf): separate shared themes from fixed page geometry`

- [x] Define shared theme access for fixed and flowing documents; preserve existing PageFrame APIs and geometry.
- [x] Split primitive modules without duplicating implementations; keep the existing import facade working.
- [x] Define flow-page header/footer space, non-breaking block limits and the public document/frame API before coding dependents.

**Acceptance:** The same text/layout primitives compose inside fixed and multipage documents without changing the existing template designs.

**Targeted verification:** Existing family PDF fixtures for extraction regressions plus one shared flow specimen; no new template variants or visual-reference regeneration to hide differences.

### L12-S02b — `feat(pdf): expose composable typography layout and media primitives`

- [x] Heading, Text, Stack, Row, Separator/Divider, FieldPair/KeyValue, Image, QRCode, Section, Card, Link and List contracts from the component matrix.
- [x] Preserve existing APIs, local-asset boundaries and QR density/quiet-zone checks.
- [x] Add reusable, typed examples and document differences from PDFx behavior.

**Acceptance:** Core primitives compose with the shared theme and retain selectable text, valid links and bounded assets.

**Targeted verification:** One combined PDF specimen and focused link/input assertions; reuse existing QR decoding evidence unless its behavior changes.

### L12-S02c — `feat(pdf): add reusable pagination and table components`

- [x] KeepTogether, PageBreak, PageHeader, PageFooter, PageNumber, Table and DataTable.
- [x] Reuse flow-table helpers rather than maintaining separate invoice and component table engines.
- [x] Define repeated space, final page counts, row overflow and oversized-group handling explicitly.

**Acceptance:** A representative long table retains its first/last rows, repeating headers, final page count and summary without footer overlap.

**Targeted verification:** Extend existing multipage PDF evidence with reusable components; focused tall-row/block rejection and page-break behavior.

### L12-S02d — `feat(pdf): add printable form and annotation components`

- [x] Alert, Badge, Form, Signature and Watermark with neutral defaults and explicit semantic labels.
- [x] Printable one/two/three-column fields, single/dual signer areas and controlled repeated watermark placement.
- [x] State that these are static document elements, not interactive AcroForms, cryptographic signatures or document protection.

**Acceptance:** The shared specimen shows all five categories without missing labels or overlapping content.

**Targeted verification:** Actual PDF content and representative layout inspection; invalid dimensions/groups tested only where not covered by shared validation.

### L12-S02e — `feat(pdf): add vector graph components`

- [x] Bar, horizontal bar, line, area, pie and donut from bounded typed data, with labels and legends.
- [x] PDF-native vectors, monochrome defaults, no site chart imports or canvas screenshot substitutes.
- [x] Define empty/non-finite data, zero ranges, pie/donut negative values, text density and numeric scales before exposing the API.

**Acceptance:** All six graph forms produce legible real PDFs and invalid inputs fail explicitly.

**Targeted verification:** Focused scale/geometry unit cases, one multi-chart PDF specimen and visual inspection; no theme/locale matrix.

### L12-S02f — `feat(pdf): add validated vector barcodes`

- [x] Qualify a local encoder and independent decoder with exact versions, licenses and measured bundle impact.
- [x] Implement the proposed Code 128 and EAN-13 surface with explicit payload/check-digit rules, physical sizes and quiet zones.
- [x] Reject impossible density/size combinations and keep optional readable text separate from the machine-readable pattern.

**Acceptance:** Both supported formats decode to the expected payload from rasterized final PDFs; unsupported formats and invalid values do not silently render another symbol.

**Targeted verification:** Shared barcode unit/PDF cases for the distinct format risks and one browser/Node boundary check. Physical scanner/printer qualification remains an explicit limitation.

### L12-S02g — `feat(registry): expose individually installable PDF components`

- [ ] Component-sized official shadcn registry items, dependency closures and typed usage examples; preserve the existing docn-primitives item.
- [ ] Source views show the selected component and direct relevant files, not an unrestricted repository browser.
- [ ] Do not pull templates, barcode encoders, site UI, or the full render pipeline into unrelated basic component installations.
- [ ] Preserve the existing consumer components.json, aliases and owned files; no additional initializer or forced overwrite.

**Acceptance:** A basic primitive and a dependency-rich composition install and render outside the monorepo through the official CLI without replacing the consumer's configuration.

**Targeted verification:** Registry graph checks and the existing two-environment consumer orchestration adapted to distinct dependency closures, not an installation per component.

### L12-S02h — `feat(docs): expose PDF primitives formats and theme examples`

- [ ] Index/detail pages for actually available primitives with props, usage, PDF example, source/installation.
- [ ] Replace inert component names with working detail links; cover the component matrix, including Barcode, in sidebar and search.
- [ ] Format pages with actual dimensions/compatibility; compare themes on the same document.
- [ ] Retain the approved shadcn shell, enlarged preview and shared code-block styling, including visually hidden scrollbars and keyboard scrolling.
- [ ] Generate visuals through the existing pipeline; no test per paragraph or documentation card.

**Acceptance:** components/formats/themes routes are complete, indexable, and consistent with code contracts. Every advertised component has real output and an installable source entry, not a placeholder.

**Targeted verification:** Inventory/link checks and one documentation navigation smoke check; targeted visual review.

### L12-S03 — `docs(contributing): define template contribution and review workflow`

- [ ] Template contribution guide: schema/metadata/composition/fixture/registry/preview and a test in the appropriate scope.
- [ ] Visual/data quality checklist, licenses, format/API changes, and versioning.
- [ ] Include all documentation in search, titles/descriptions/canonical URLs, and sitemap; preview URLs must not be indexable.

**Acceptance:** Contributors can add a composition without changing playground core or copying an entire family.

**Targeted verification:** pnpm validate; pnpm build; static links. No full PDF suite for a documentation-only change.

## Exit criteria

Usable catalog, primitives, and guides; all 24 PDFx component categories mapped to implemented docn-ui capabilities, plus the qualified Barcode surface. No misleading examples, incomplete source, inert names or unaccepted parity gaps. Existing template appearance is preserved.

Update [status](../status.json) and create `docs/qa/L12.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No blog engine, CMS, fully multilingual documentation, forum, template redesign, proprietary CLI, unrestricted barcode engine, interactive PDF forms, digital signatures, or new print/compliance guarantees. Any additional barcode symbology or unsupported PDFx behavior requires an explicit scope decision.
