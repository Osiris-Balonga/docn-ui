# L13 — Targeted accessibility, security, and performance

Status: **merged** in [PR #44](https://github.com/Osiris-Balonga/docn-ui/pull/44) at `a2abf5c0894c79a774ac384d593c72710fe96395` on 2026-09-01. Branch: `chore/production-hardening`, based on `dev` commit `611bb2222fce347bc8f9cd4a9f76f8a1d2c9f270`.

Dependencies: L12. Requirements: NFR-01, NFR-02, NFR-04, NFR-07, NFR-10.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../TESTING.md), [reference 2](../../RELEASE.md), [reference 3](../../specs/DOCUMENT_MODEL.md), [reference 4](../../../DESIGN.md).

## Scope and files

Fix observed defects in existing journeys; do not begin a redesign or a campaign of thousands of tests.

Target files/responsibilities: apps/www coordination/viewer/UI, build/header security, budgets, and docs/qa/L13.md.

## Stories and commits in order

### L13-S01 — `fix(a11y): complete keyboard and responsive document workflows`

- [x] Keyboard access in the current family tabs and preview/export controls; accessible names and restored dialog focus. Removed editor-only controls are not claimed as current surfaces.
- [x] Announce page/zoom changes without visual noise; static preview images retain text alternatives. PDF.js text layers are not used by the current static-image catalog.
- [x] Preserve mobile download, 250% preview zoom, long-code scrolling, narrow layouts and reduced motion without a per-combination snapshot matrix.

**Acceptance:** The complete journey works without a mouse or global overflow; clearly state PDF file accessibility limitations.

**Targeted verification:** Extend existing accessibility E2E, axe on significant states, manual screen-reader/keyboard checks.

### L13-S02 — `perf(pdf): bound rendering work and viewer memory`

- [x] Measure initial catalog loading and memory after 20 family/preview transitions; template generation measures all 18 current fixtures. Interactive edit timings are not applicable after the editor's V1 removal.
- [x] Bound preview and final PDFs to 50 pages, release page/document/canvas resources and lazy-load PDF.js where the canvas is used. Consumer scheduling remains caller-owned.
- [x] Record indicative numeric observations from the local Windows reference environment without universal claims.
- [x] Confirm no PDF engine chunk on the documentation route, a recommended 15 s consumer timeout and a maximum of 50 pages. No site queue exists in the current static catalog.

**Acceptance:** No unbounded growth of workers/URLs/canvases; changing the site theme does not rerender PDFs.

**Targeted verification:** One reproducible measurement scenario, bundle analysis, and existing cleanup integration; no fragile timing assertions in every test.

### L13-S03 — `fix(security): harden assets links and generated-document boundaries`

- [x] Review MIME, PNG/JPEG magic bytes, size envelopes, forbidden source URLs, link schemes and sanitized errors.
- [x] Serve the actual static build with a CSP and defensive headers compatible with local images, fonts and blob workers.
- [x] Retain local-only document data, disabled Next telemetry and bundled fonts; no document input is stored or sent by the current catalog.
- [x] Configure weekly npm and GitHub Actions dependency PRs without auto-merge or a new scanner.

**Acceptance:** Hostile inputs are rejected; network constraints do not prevent nominal generation.

**Targeted verification:** Targeted negative tests in existing suites; privacy/security E2E on the actual build; verify:assets.

### L13-S04 — `docs(quality): record browser support and performance evidence`

- [x] Document the tested browser/OS, runner configuration, budgets, errors and limitations.
- [x] Keep Chromium as the CI target; explicitly leave actual Firefox, Safari and iOS Safari unclaimed because those engines were unavailable locally.
- [x] Update the verification matrix and carry physical printing plus non-Chromium browser qualification into L14.

**Acceptance:** Public promises exactly match observed results; exceptions identified for L14.

**Targeted verification:** QA report and evidence inspection; do not rerun already passing suites at the same SHA just to write the report.

## Exit criteria

Quality risks addressed or explicitly documented as limitations; private data remains local.

Update [status](../status.json) and create `docs/qa/L13.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No analytics, giant benchmark, new suite per dependency, or PDF/UA certification.
