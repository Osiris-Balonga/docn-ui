# L14 — V1 qualification with proportionate tests

Status: **merged** in [PR #52](https://github.com/Osiris-Balonga/docn-ui/pull/52) at merge commit `da10836b00240f4df1919863a6cca07de92a8ee8` on 2026-09-01. Branch: `test/v1-qualification`, based on L13 merge `a2abf5c0894c79a774ac384d593c72710fe96395`.

Dependencies: L13. Requirements: FR-01–FR-16; NFR-01–NFR-10; G5.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../TESTING.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../PRD.md).

## Scope and files

Close demonstrated coverage gaps and audit the existing suite. Do not recreate all evidence from previous lots.

Target files/responsibilities: Existing PDF/E2E/consumers/visual suites; docs/qa/L14.md.

## Stories and commits in order

### L14-S01 — `test(quality): close distinct v1 coverage gaps`

- [x] Map every requirement to existing evidence; correct the PRD's obsolete editor/ticket/label scope instead of adding tests for withdrawn behavior.
- [x] Verify exclusive globs, actual test collection, absence of silently successful scripts, and accurate command names.
- [x] Remove the empty integration project/command after the editor's removal; retain every current edge case.
- [x] Record counts/timings per scope for diagnosis, not as a target to increase.

**Acceptance:** Every new test has a written bug/risk in review; each file belongs to one scope.

**Targeted verification:** Vitest/Playwright listings and execution of only new cases first.

### L14-S02 — `test(pdf): approve representative visual and consumer baselines`

- [x] Review the current 17-composition / 21-page contact sheet; retain seven references covering every family and both sides of one business card.
- [x] Pin the existing PDF.js/canvas rasterizer versions, bundled fonts, exact dimensions and SHA-256 references; no comparison threshold exists to weaken.
- [x] Explicitly activate `test:visual` and add it to `test:all`; selected PDF references do not rerun E2E journeys.
- [x] Extend both consumers to distinct business-card, invoice, and reusable-component dependency closures; labels/sheets remain outside the maintainer-approved V1 families.
- [x] Keep generated PDFs/reports out of Git; selected references and fingerprints live under `tests/visual`.

**Acceptance:** Designs are actually reviewed; installation covers new dependencies without a scenario explosion.

**Targeted verification:** pnpm test:pdf; pnpm test:visual; pnpm test:consumers, reusing valid PDFs/artifacts.

### L14-S03 — `docs(qa): record v1 functional and print qualification`

- [x] Run one orchestrated full validation on candidate `ef4fe20` with one fingerprinted build reused by E2E.
- [x] Review French/English data evidence, keyboard use, zoom, code copying, downloads, and PDF boxes on representative formats.
- [x] Record that no printer/scanner, actual Safari/iOS Safari, or hardware barcode reader was available; tickets/sheets are outside current V1.
- [x] Complete the requirement→evidence/result matrix and explicitly accepted limitations; no implicit exceptions.

**Acceptance:** G5 reached: V1 locally qualified with explicit limitations; publication not yet claimed.

**Targeted verification:** pnpm validate:full; targeted manual QA. Do not rerun coverage and then lightweight tests in this same pass.

## Exit criteria

Evidence for every requirement or an approved exception, a maintainable suite, and known runtime. No blocking export/data/content-loss bug.

Update [status](../status.json) and create `docs/qa/L14.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No combinatorial themes×formats×languages×browsers matrix or third-party library compliance tests.
