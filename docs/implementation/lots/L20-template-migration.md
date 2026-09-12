# L20 — Complete template catalog migration

Initial status: **planned**. Proposed branch: `refactor/unified-template-catalog`.

Dependencies: L19. Requirements: FR-22, NFR-12, NFR-13.

## Reading and entry criteria

Read ADR 0006, the unified API, styling policy, the template-by-template matrix, component catalog, existing family evidence and L19 results. The L19 capability review must have either qualified or narrowed every promised public-component mapping.

## Scope and files

Migrate all 18 templates through small, bisectable commits. First freeze a visual/structural baseline. For each family, land a shared data/definition contract before its templates. Each template story extracts business data from presentation props, adds its renderable definition, preserves a deprecated compatibility wrapper, updates direct `registryDependencies`, and verifies only that template plus changed shared behavior.

No current catalog template is assumed to be flowing. Fixed templates preserve their geometry. All three `receipt-80` compositions deliberately move from hard-coded heights to measured continuous plans and therefore receive a major template version with migration notes.

## Stories and commits in order

### L20-S01 — `test(templates): freeze the pre-migration catalog baseline`

- [ ] Record source/version/format/page count/text and asset fingerprints for all 18 definitions.
- [ ] Generate a labeled contact sheet and retain links to full-size accepted renders.
- [ ] Add family/template filters to the existing parameterized PDF test file without duplicating the suite.

**Acceptance:** Every later template commit has an immutable local comparison target and can run one family or one ID.

**Targeted verification:** Existing nominal catalog generation, dimension/content checks and human contact-sheet review; no new edge-case matrix.

### L20-S02 — `feat(invoices): define the shared invoice data contract`

- [ ] Define strict parties, date-only fields, currency, integer quantity/minor-unit price/tax inputs, deterministic calculations and bounded legal/payment text.
- [ ] Define fixed-A4 defaults and the shared invoice theme envelope; do not advertise Letter until a template is qualified for it.
- [ ] Create the four-row invoice schema-contract table entries.

**Acceptance:** Presentation strings and caller-calculated totals are not the canonical invoice data contract.

**Targeted verification:** Focused schema, money, date and compatibility units.

### L20-S03 — `refactor(invoice-spacious): adopt the unified template contract`

- [ ] Extract parties, dates, integer lines/totals and logo image ID; adopt public table/header/key-value/image/link components where qualified.
- [ ] Preserve the legacy props/style wrapper and update this item's `registryDependencies` in the same commit.

**Acceptance:** `invoice-spacious` renders through the flat facade with baseline geometry and documented visual differences only.

**Targeted verification:** Filtered schema/PDF test for `invoice-spacious` and baseline comparison.

### L20-S04 — `refactor(invoice-vertical): adopt the unified template contract`

- [ ] Extract parties, dates, integer lines/totals and payment QR payload; remove duplicated public structures.
- [ ] Preserve its wrapper and registry closure in the same commit.

**Acceptance:** `invoice-vertical` uses unified data/theme/rendering while retaining its vertical identity and QR content.

**Targeted verification:** Filtered PDF/content/QR check and baseline comparison.

### L20-S05 — `refactor(invoice-corporate): adopt the unified template contract`

- [ ] Extract parties, bank/payment fields, dates and integer lines/tax/totals; replace the local table clone with the qualified public table.
- [ ] Preserve its wrapper and registry closure; keep the original vector mark local.

**Acceptance:** `invoice-corporate` uses public table/key-value/region/signature capabilities without changing fixed A4 output silently.

**Targeted verification:** Filtered PDF/content/money test and baseline comparison.

### L20-S06 — `refactor(invoice-photo-header): adopt the unified template contract`

- [ ] Extract parties, dates, integer lines/totals and the validated header image ID.
- [ ] Preserve its wrapper and registry closure; keep photographic crop behavior template-owned.

**Acceptance:** `invoice-photo-header` no longer accepts an arbitrary image source or caller totals in canonical data.

**Targeted verification:** Filtered PDF/image/money test and baseline comparison.

### L20-S07 — `feat(receipts): define continuous receipt data and version contracts`

- [ ] Define merchant/order/product, timestamp/time-zone, payment, currency and integer monetary cores as applicable.
- [ ] Decide all three current `receipt-80` templates are continuous measured plans; record the physical-height change as a new major template version.
- [ ] Define final-marker, line/height limits and the three schema-contract rows.

**Acceptance:** Fixed-height legacy behavior remains available only through explicit wrappers; new definitions never claim unchanged physical compatibility.

**Targeted verification:** Focused receipt schemas, calculations, version metadata and plan-limit units.

### L20-S08 — `refactor(receipt-order-confirmation): adopt a measured render plan`

- [ ] Extract customer/order/shipping/payment, integer product amounts and validated logo/product image IDs.
- [ ] Use qualified table/key-value/divider/image components; preserve wrapper and registry closure.

**Acceptance:** The order confirmation measures content at `receipt-80`, rejects overflow and documents its major migration.

**Targeted verification:** Filtered nominal/long PDF and image-channel checks plus baseline content comparison.

### L20-S09 — `refactor(receipt-product-barcode): adopt a measured render plan`

- [ ] Extract product/reference, integer amount/currency and barcode value.
- [ ] Use compact public table/key-value/divider/barcode capabilities; preserve wrapper and registry closure.

**Acceptance:** The product receipt measures height and its final barcode encodes the displayed value.

**Targeted verification:** Filtered nominal/overflow PDF and barcode decode.

### L20-S10 — `refactor(receipt-cash-register): adopt a measured render plan`

- [ ] Extract merchant/time-zone/payment, integer items/tax/totals and barcode value; remove `Number` arithmetic on formatted strings.
- [ ] Use compact banded Table where qualified; preserve an intentional local dashed rule only if L19 did not qualify it.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** The cash receipt has deterministic money, measured height and explicit overflow.

**Targeted verification:** Filtered money/nominal/overflow PDF and barcode checks.

### L20-S11 — `feat(reports): define the shared report data contract`

- [ ] Define bounded periods, KPIs, table records, quotations and Graph datasets/formatters outside presentation components.
- [ ] Set fixed-A4 defaults and add the three report schema-contract rows.

**Acceptance:** Report components consume business datasets rather than hard-coded chart values.

**Targeted verification:** Focused report schema and Graph-bound normalization units.

### L20-S12 — `refactor(report-product-analytics): adopt public data components`

- [ ] Extract KPI and acquisition-series data; use public Graph/DataTable/Badge/Section/regions where qualified.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Product analytics contains no template-local chart engine and preserves fixed A4 labels.

**Targeted verification:** Filtered PDF text/graph test and baseline comparison.

### L20-S13 — `refactor(report-marketplace-revenue): adopt grouped multi-series Graph`

- [ ] Extract currency/totals, comparison series and conclusion; use grouped bars with trusted formatters.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Marketplace revenue uses the public bounded multi-series contract.

**Targeted verification:** Filtered PDF legend/label/value test and baseline comparison.

### L20-S14 — `refactor(report-customer-support): adopt public data components`

- [ ] Extract service KPIs, survey series, quotations and portrait image ID; use Graph/DataTable/Badge/Section/Image where qualified.
- [ ] Preserve a documented quotation composition exception, wrapper and registry closure.

**Acceptance:** Customer support data and image selection are validated outside the visual component.

**Targeted verification:** Filtered PDF/image/graph test and baseline comparison.

### L20-S15 — `feat(resumes): define the shared resume data contract`

- [ ] Define bounded person/contact, summary, entry, education, skills and link structures plus optional portrait image ID.
- [ ] Set fixed-A4 defaults and add the three resume schema-contract rows.

**Acceptance:** All resume business fields are validated independently of their columns and typography.

**Targeted verification:** Focused resume schema/link/image-ID units.

### L20-S16 — `refactor(resume-classic): adopt the unified template contract`

- [ ] Use qualified Section/List/KeyValue/Link components while keeping two-column geometry local.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Classic resume renders through the facade with baseline fixed-A4 content.

**Targeted verification:** Filtered PDF/schema test and baseline comparison.

### L20-S17 — `refactor(resume-accountant): adopt the unified template contract`

- [ ] Use qualified Section/List/KeyValue/Badge components without inventing a generic resume engine.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Accountant resume remains distinct and uses no duplicated qualified content helper.

**Targeted verification:** Filtered PDF/schema test and baseline comparison.

### L20-S18 — `refactor(resume-designer): adopt the unified template contract`

- [ ] Extract portrait image ID and use Image/Section/List/Badge/Link while keeping sidebar geometry local.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Designer resume resolves its local portrait through the safe image channel.

**Targeted verification:** Filtered PDF/image/schema test and baseline comparison.

### L20-S19 — `feat(badges): define the shared badge data contract`

- [ ] Define person, role/organization, identifier, portrait/pattern image IDs and optional QR payload.
- [ ] Set fixed `badge-54x86` defaults, side rules and the three badge schema-contract rows.

**Acceptance:** Badge identity data is independent of the shared portrait layout and decorative vectors.

**Targeted verification:** Focused badge schema, image-ID, QR and side metadata units.

### L20-S20 — `refactor(badge-profile-lanyard): adopt the unified template contract`

- [ ] Route portrait, theme, format and print profile through the definition while retaining original reverse vectors.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Profile lanyard preserves two-page order and exact badge geometry.

**Targeted verification:** Filtered side/dimension/image PDF test and baseline comparison.

### L20-S21 — `refactor(badge-qr-portrait-light): adopt the shared badge contract`

- [ ] Use shared portrait layout, validated image ID and QR payload.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Light QR badge renders through the facade and its code remains decodable.

**Targeted verification:** Filtered dimension/image/QR PDF test and baseline comparison.

### L20-S22 — `refactor(badge-qr-portrait-blue): adopt the shared badge contract`

- [ ] Use shared portrait layout plus validated portrait/pattern IDs and QR payload.
- [ ] Preserve template-owned pattern treatment, wrapper and registry closure.

**Acceptance:** Blue QR badge preserves geometry and validates both local images separately.

**Targeted verification:** Filtered dimension/image/QR PDF test and baseline comparison.

### L20-S23 — `feat(cards): define the shared business-card data contract`

- [ ] Define person, role/organization, contact/link and optional QR structures.
- [ ] Preserve each fixed format and two-page ordering; add the two card schema-contract rows.

**Acceptance:** Card business data is independent of original identity vectors.

**Targeted verification:** Focused contact/link/QR schema and side metadata units.

### L20-S24 — `refactor(business-card-coral-qr): adopt the unified template contract`

- [ ] Use qualified Card/KeyValue/Link/QRCode components while retaining original mark/icons where documented.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Coral card renders two equal `card-90x50` pages and a decodable contact QR.

**Targeted verification:** Filtered two-page/dimension/QR PDF test and baseline comparison.

### L20-S25 — `refactor(business-card-violet-founder): adopt the unified template contract`

- [ ] Use qualified Card/KeyValue/Link components while retaining original identity vectors.
- [ ] Preserve wrapper and registry closure.

**Acceptance:** Violet founder card renders two equal `card-85x55` pages through the facade.

**Targeted verification:** Filtered two-page/dimension/content PDF test and baseline comparison.

### L20-S26 — `test(templates): qualify the complete migrated catalog`

- [ ] Require the schema-contract table, metadata and renderable definition to contain exactly the same 18 IDs.
- [ ] Run filtered family suites plus one nominal all-catalog pass; review the post-migration contact sheet against baseline.
- [ ] Document every intentional raw React PDF/local helper exception and every visual/API/version deviation.
- [ ] Verify every legacy wrapper and final registry closure without removing consumer-owned compatibility silently.

**Acceptance:** No shipped template remains on the old definition path, all business data is externalized, and all catalog/preview/registry surfaces derive from the migrated sources.

**Targeted verification:** Catalog/registry generation, family-filtered PDF suites, one nominal inventory pass and human contact-sheet review. No template × theme × format Cartesian product.

## Exit criteria

All 18 templates—not only a pilot—use the unified contract and appropriate public components. Fixed geometry is preserved, receipt geometry changes are explicitly major-versioned, wrappers remain for the declared window, and every registry dependency closure is current.

Update status and `docs/qa/L20.md`. Do not merge automatically or publish migrated source at an immutable path without separate authorization.

## Out of scope

No new template family, generic document engine, CMS, arbitrary JSX evaluation or redesign undertaken solely to imitate a competitor.
