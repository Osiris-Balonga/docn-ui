# L14 — V1 qualification with proportionate tests

Status: **in progress**. Branch: `test/v1-qualification`, based on L13 merge `a2abf5c0894c79a774ac384d593c72710fe96395`.

Dependencies: L13. Requirements: FR-01–FR-16; NFR-01–NFR-10; G5.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../TESTING.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../PRD.md).

## Scope and files

Close demonstrated coverage gaps and audit the existing suite. Do not recreate all evidence from previous lots.

Target files/responsibilities: Existing PDF/E2E/consumers/visual suites; docs/qa/L14.md.

## Stories and commits in order

### L14-S01 — `test(quality): close distinct v1 coverage gaps`

- [ ] Map every requirement to existing evidence; add only uncovered risks.
- [ ] Verify exclusive globs, actual test collection, absence of silently successful scripts, and accurate command names.
- [ ] Remove redundant/internal-detail tests; consolidate shared fixtures without removing real edge cases.
- [ ] Record counts/timings per scope for diagnosis, not as a target to increase.

**Acceptance:** Every new test has a written bug/risk in review; each file belongs to one scope.

**Targeted verification:** Vitest/Playwright listings and execution of only new cases first.

### L14-S02 — `test(pdf): approve representative visual and consumer baselines`

- [ ] Review the fifteen-composition contact sheet; targeted visual references, at least one per family, extra variants only when necessary.
- [ ] Stabilize rasterizer/fonts/runner; human-approved differences, no threshold increases to hide defects.
- [ ] Explicitly activate `test:visual` and add it to `test:all`; selected PDF references, no E2E journeys rerun under a different label.
- [ ] Extend both consumers to distinct business-card, invoice, and reusable-component dependency closures; labels/sheets remain outside the maintainer-approved V1 families.
- [ ] Keep generated PDFs/reports out of Git; selected references and fingerprints in dedicated locations.

**Acceptance:** Designs are actually reviewed; installation covers new dependencies without a scenario explosion.

**Targeted verification:** pnpm test:pdf; pnpm test:visual; pnpm test:consumers, reusing valid PDFs/artifacts.

### L14-S03 — `docs(qa): record v1 functional and print qualification`

- [ ] Run one orchestrated full validation on a clean candidate with one build; reuse results from the same SHA.
- [ ] Manually review French/English document data, keyboard use, zoom, code copying, downloads, and print settings on representative formats.
- [ ] If hardware is available, print a card/sheet at 100% and scan a ticket; otherwise record the limitation without inventing validation.
- [ ] Complete the requirement→evidence/result matrix and explicitly accepted defects; no implicit exceptions.

**Acceptance:** G5 reached: V1 locally qualified with explicit limitations; publication not yet claimed.

**Targeted verification:** pnpm validate:full; targeted manual QA. Do not rerun coverage and then lightweight tests in this same pass.

## Exit criteria

Evidence for every requirement or an approved exception, a maintainable suite, and known runtime. No blocking export/data/content-loss bug.

Update [status](../status.json) and create `docs/qa/L14.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No combinatorial themes×formats×languages×browsers matrix or third-party library compliance tests.
