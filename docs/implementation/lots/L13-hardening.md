# L13 — Targeted accessibility, security, and performance

Status: **in progress**. Branch: `chore/production-hardening`, based on `dev` commit `611bb2222fce347bc8f9cd4a9f76f8a1d2c9f270`.

Dependencies: L12. Requirements: NFR-01, NFR-02, NFR-04, NFR-07, NFR-10.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../TESTING.md), [reference 2](../../RELEASE.md), [reference 3](../../specs/DOCUMENT_MODEL.md), [reference 4](../../../DESIGN.md).

## Scope and files

Fix observed defects in existing journeys; do not begin a redesign or a campaign of thousands of tests.

Target files/responsibilities: apps/www coordination/viewer/UI, build/header security, budgets, and docs/qa/L13.md.

## Stories and commits in order

### L13-S01 — `fix(a11y): complete keyboard and responsive document workflows`

- [ ] Keyboard access in the palette, filters, forms, tabs, viewer, and export buttons; accessible names and restored focus.
- [ ] Announce errors/progress without spam; accessible data outside canvas, PDF.js text layer if supported by the qualified version.
- [ ] Fix responsive layout, long code, tall receipts, 200% zoom, and reduced motion; no snapshot for every combination.

**Acceptance:** The complete journey works without a mouse or global overflow; clearly state PDF file accessibility limitations.

**Targeted verification:** Extend existing accessibility E2E, axe on significant states, manual screen-reader/keyboard checks.

### L13-S02 — `perf(pdf): bound rendering work and viewer memory`

- [ ] Measure initial loading, warm/cold card time, long receipt/invoice, and memory after 20 edits/navigation transitions.
- [ ] Confirm backpressure/timeout, bound canvas pages in memory, release old documents/URLs, avoid eager imports.
- [ ] Set numeric budgets from the documented reference environment; do not present laptop metrics as universal.
- [ ] Nonnegotiable architecture budgets: no PDF engine on a simple documentation route, one active job plus one pending, 15 s timeout, maximum 50 pages.

**Acceptance:** No unbounded growth of workers/URLs/canvases; changing the site theme does not rerender PDFs.

**Targeted verification:** One reproducible measurement scenario, bundle analysis, and existing cleanup integration; no fragile timing assertions in every test.

### L13-S03 — `fix(security): harden assets links and generated-document boundaries`

- [ ] Review MIME/magic bytes/sizes, forbidden source URLs, link schemes, and sanitized errors.
- [ ] Define CSP/headers compatible with the actual build on a test static server; test actual workers and fonts.
- [ ] Check that URLs/logs/storage contain no document data, with no telemetry or remote fonts; verify supply chain and licenses.
- [ ] Configure dependency checks and updates without auto-merge; do not install an unnecessary server scanner.

**Acceptance:** Hostile inputs are rejected; network constraints do not prevent nominal generation.

**Targeted verification:** Targeted negative tests in existing suites; privacy/security E2E on the actual build; verify:assets.

### L13-S04 — `docs(quality): record browser support and performance evidence`

- [ ] Document actually tested browsers/OSes, runner configuration, budgets, errors, and limitations.
- [ ] Target Chromium in CI; manually smoke-test actual Firefox and Safari when available. Automated WebKit does not prove Safari/iOS support.
- [ ] Update the verification matrix and address remaining risks without hiding them behind universal compatibility claims.

**Acceptance:** Public promises exactly match observed results; exceptions identified for L14.

**Targeted verification:** QA report and evidence inspection; do not rerun already passing suites at the same SHA just to write the report.

## Exit criteria

Quality risks addressed or explicitly documented as limitations; private data remains local.

Update [status](../status.json) and create `docs/qa/L13.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No analytics, giant benchmark, new suite per dependency, or PDF/UA certification.
