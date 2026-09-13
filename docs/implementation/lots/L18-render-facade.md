# L18 — Unified Node and browser rendering facade

Initial status: **planned**. Proposed branch: `feat/unified-render-facade`.

Dependencies: L17. Requirements: FR-19, FR-20, NFR-12, NFR-14; ADR 0006.

## Reading and entry criteria

Read the L17 specification, merged or otherwise authorized L17 evidence, ADR 0003, ADR 0006, the document model and registry asset guide. The L17 public contract must be fixed before runtime work begins.

## Scope and files

Provide matching source-owned `renderPdf(template, { data, theme?, format?, locale?, printProfile?, revision? }, runtimeOptions?)` entry points for Node and browser. Hide routine format resolution, plan construction, font registration and React PDF engine calls while preserving explicit advanced APIs. Add the interruptible protocol V2 worker path used by interactive browser callers.

Target responsibilities: render runtime, platform adapters, result inspection, continuous measurement, exports, focused fixtures and runtime documentation.

## Stories and commits in order

### L18-S01 — `feat(render): add the unified Node renderPdf facade`

- [x] Normalize and validate through L17, register manifest-bound local fonts once, dispatch the plan kind and finalize the PDF.
- [x] Implement exact `NodeRenderRuntimeOptions`: the optional module-relative `../../assets/` font directory default and the runtime-only local-image resolver, with an explicit contained directory override.
- [x] Return the existing `RenderResult` fields without aliases; never return bare bytes in place of `RenderResult` from the primary facade.
- [x] Copy a caller-supplied revision unchanged, default a one-shot omitted revision to 1, and never infer stale state in the runtime.

**Acceptance:** A Node consumer renders a representative template without importing React, React PDF, format resolution, font registration or plan helpers.

**Targeted verification:** Focused Node fixed-template and existing `ComponentDocument` flow-specimen render tests, missing-font failure and exact result-field assertions.

### L18-S02 — `feat(render): add the matching browser renderPdf facade`

- [x] Export the same call shape from the browser entry.
- [x] Implement exact `BrowserRenderRuntimeOptions`: default font assets to `globalThis.location.origin`, allow only an explicit same-origin base URL, and keep the local-image resolver runtime-only.
- [x] Resolve document images only through the separate validated local-image resolver in `runtimeOptions`; template data contains IDs, never URLs.
- [x] Create the runtime-owned `ResolvedLocalImage` lookup consumed by plan factories and dispose every resolved source centrally on success and failure; S04 owns cancellation, supersession, timeout, and worker-termination lifecycle hooks because S02 has no worker protocol.
- [x] Keep bytes suitable for caller-owned preview and download copies.

**Acceptance:** Source-compatible input produces the same normalized fingerprint and expected document geometry in Node and browser.

**Targeted verification:** Browser unit/build fixture and one Chromium render; do not repeat site E2E.

### L18-S03 — `feat(render): unify continuous and structured result handling`

- [ ] Add browser continuous measurement using the qualified final-marker and height limits.
- [ ] Inspect actual page count and final dimensions for every plan kind.
- [ ] Translate renderer/measurement/finalization failures into structured errors without personal data.

**Acceptance:** Fixed, flow and continuous plans all return the same result contract in both environments where supported.

**Targeted verification:** The bounded continuous feasibility fixture in Node and browser, one overflow failure, page/dimension/result assertions; no catalog receipt migration.

### L18-S04 — `feat(worker): add interruptible render protocol v2`

- [ ] Serialize the flat normalized request, complete resolved theme, caller revision and validated image descriptors under protocol V2.
- [ ] Transfer private copies of validated local PNG/JPEG bytes in a separate bounded message channel keyed by canonical image ID and digest; detachment must not mutate the preflight-owned copy.
- [ ] Resolve templates inside the worker through a static trusted ID-to-loader map; never transfer `RenderableTemplate`, Zod schemas, `createPlan`, `runtimeOptions`, or resolvers through `postMessage`.
- [ ] Keep protocol V2 JSON-only apart from separately transferred `ArrayBuffer`s; no function, `URL`, schema, template object, or platform runtime object is a protocol field.
- [ ] Permit one active render and one latest pending request; interrupt and recreate the worker on supersession, timeout or navigation.
- [ ] Let the worker drop completions whose revision is no longer current and let the UI mark a retained last-valid result stale; do not add `stale` to `RenderResult`.

**Acceptance:** Superseded or timed-out work cannot replace the latest result, retain transferred image data or leave an unbounded worker running.

**Targeted verification:** Worker protocol/transfer units plus focused supersession, timeout, termination and stale-result browser integration tests.

### L18-S05 — `test(render): qualify facade parity limits and cleanup`

- [ ] Cover custom validated theme and `baseThemeId`, format/profile incompatibility, final-byte limit and caller-revision propagation at the lowest applicable layer.
- [ ] Verify no remote font request and no silent fallback.
- [ ] Verify image MIME/header, size, pixel and digest rejection in the separate local-image channel.
- [ ] Record bundle/dependency impact and L18 QA evidence.

**Acceptance:** The simpler facade demonstrably preserves V1 safety and physical-output behavior.

**Targeted verification:** Focused runtime suites, external-shaped fixtures and one browser network interception; no 18-template matrix.

## Exit criteria

Node and browser expose one call shape and representative fixed, flow and continuous evidence passes. Advanced plan functions remain exported and documented separately.

Update status and `docs/qa/L18.md`. A passing local facade does not authorize publication or changing an immutable registry path.

## Out of scope

No template-family migration, component redesign, Theme Studio, hosted renderer or general-purpose worker scheduler product.
