# L09 — Thermal receipts and shared calculations

Initial status: **planned**. Branch: `feat/thermal-receipt-templates`.

Dependencies: L08. Requirements: FR-10, FR-13, FR-16; NFR-05.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/DOCUMENT_MODEL.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../TESTING.md).

## Scope and files

Three fixed-width receipts with adaptive height. The money core will support invoices without repeating calculation tests.

Target files/responsibilities: packages/documents/src/core/money, templates/receipts, receipt form, and registry.

## Stories and commits in order

### L09-S01 — `feat(receipts): add minor-unit totals and receipt data contracts`

- [ ] Implement safe minor-unit calculations, basis-point rates, half-up rounding, and sums; V1 integer quantities.
- [ ] Schemas and limits, explicit currencies/exponents, no PAN or sensitive payment data.
- [ ] Test distinct economic cases: zero, tax rounding, currency without decimals, overflow, multiline totals; keep these tests in money.

**Acceptance:** Deterministic totals shared by receipts/future invoices; no implicit floating-point monetary arithmetic.

**Targeted verification:** pnpm test:unit money; do not repeat every calculation in PDF tests.

### L09-S02 — `feat(receipts): add retail hospitality and service roll layouts`

- [ ] Create retail/hospitality/service compositions and 58/80 mm variants with readable text sizes.
- [ ] Reuse height qualified in L02; verify last lines and footers, limit to 2,000 mm, error without truncation.
- [ ] Monochrome-adapted themes and safe logo imports; connect editor, catalog, source, and registry.

**Acceptance:** A short receipt is not an A4 page; a long receipt retains its total; 58 mm is not an unreadable shrink of 80 mm.

**Targeted verification:** Family PDF suite: nominal examples, narrow boundary, long fixture; reuse feasibility fixtures.

### L09-S03 — `test(receipts): verify variable-height output and limit recovery`

- [ ] Consolidate height/maximum checks and user messages; no test for every possible line count.
- [ ] One receipt visual reference and a manual readability check in the long-document viewer.
- [ ] Document paper width versus printable width, 100% scale, and hardware limitations.

**Acceptance:** Explain overflow and resume rendering after correction; never substitute a multipage invoice for a receipt.

**Targeted verification:** pnpm test:pdf receipt; a family error component test only if specific; pnpm verify:registry.

## Exit criteria

Nine compositions in total; reusable calculations and height without duplicated application logic.

Update [status](../status.json) and create `docs/qa/L09.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No direct printer commands, ESC/POS protocol, tax compliance, or actual payments.
