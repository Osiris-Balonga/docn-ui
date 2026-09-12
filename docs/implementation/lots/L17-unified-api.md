# L17 — Unified template and theme contract

Initial status: **planned**. Active branch: `feat/unified-template-api`; current state is tracked in [`status.json`](../status.json).

Dependencies: L16. Requirements: FR-18, FR-20, NFR-12; ADR 0006.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md), [agent rules](../../../AGENTS.md), [ADR 0006](../../adr/0006-unified-template-rendering-api.md), [document model](../../specs/DOCUMENT_MODEL.md), [template catalog](../../specs/TEMPLATE_CATALOG.md) and the observed L16 exit evidence. L16 must have reached its truthful terminal state before this post-V1 branch begins. A released state is not assumed.

## Scope and files

Define the public contract before changing template layouts. Reconcile the current theme, template metadata, request/result and compatibility surfaces. Introduce an additive adapter for one fixed catalog template, use the existing `ComponentDocument`/`DocumentFrame` specimen for flow-contract evidence, and use the existing continuous feasibility fixture for continuous-contract evidence; do not claim a current catalog template is flowing or continuously measured, and do not migrate the catalog in this lot.

Target responsibilities: `packages/documents/src/core`, `themes`, template contracts, focused contract tests, public exports and API documentation.

## Stories and commits in order

### L17-S01 — `docs(api): specify the unified template and theme contract`

- [x] Specify the non-React `TemplateDescriptor<TData>` normalization contract and the later `RenderableTemplate<TData>` extension with fixed/flow/continuous plan kinds.
- [x] Fix the public call as `renderPdf(template, { data, theme?, format?, locale?, printProfile?, revision? }, runtimeOptions?)`; prohibit a nested `options` object.
- [x] Specify the discriminated format input, descriptor-owned defaults, safe `CustomPdfTheme` subtype/object overload, per-template compatibility envelopes, and separate `printProfile`.
- [x] Preserve the advanced theme API while limiting the quick path to preset-equivalent themes, color overrides, and explicitly qualified per-template font-family opt-ins.
- [x] Separate fixed font-manifest assets from bounded local document-image IDs, asynchronous preflight, pure descriptors, and the platform resolver supplied through `runtimeOptions`.
- [x] Define legacy request/template compatibility boundaries, preserve protocol V1, and reserve serializable protocol V2 plus worker interruption for L18.
- [x] Constrain render data to JSON, keep required caller data separate from explicit default/example fixtures, declare print-profile compatibility, and specify exact normalization, image-preflight, plan-context, runtime-option, and fingerprint signatures.

**Acceptance:** Reviewers can implement the contract without deciding new public names or silently weakening a V1 guarantee.

**Targeted verification:** Documentation link and terminology review; no application suite.

### L17-S02 — `feat(api): define and normalize template descriptors`

- [ ] Add the minimal non-React `TemplateDescriptor<TData>` and canonical six-family union without changing legacy `TemplateMetadata` or the React catalog `TemplateDefinition`.
- [ ] Add the canonical 18-ID `TemplateId` source; assert exact, duplicate-free coverage for legacy definitions/catalog output and valid unique membership for the partial L17 descriptor/loader maps, reserving their exact-set assertion for L20.
- [ ] Resolve defaults and validate strict data, the discriminated format input, theme/base/envelope, locale, print profile, revision, and descriptor invariants before composition.
- [ ] Require caller `data`; validate schema outputs, default data, and example data through parse → `inspectDocumentData` → parse without implicit default/example merging.
- [ ] Declare and enforce `supportedPrintProfileKinds`; reject unsupported profiles before plan creation, including `print` for L17 continuous feasibility evidence.
- [ ] Extract image IDs only after data validation; canonicalize, deduplicate, limit to two, sort, and require the exact preflight descriptor set.
- [ ] Keep image resolution asynchronous and platform-owned; give the pure normalizer only `{ id, mimeType, byteLength, widthPx, heightPx, sha256 }` descriptors.
- [ ] Deep-clone and deep-freeze the resolved theme, then fingerprint the complete normalized input, font-manifest identity, and sorted local-image descriptors.
- [ ] Keep the existing `RenderResult` names: `pdfBytes`, `finalDimensions`, `pageCount`, `diagnostics`, `fingerprint` and `revision`.
- [ ] Preserve structured paths and stable error codes.
- [ ] Leave `PDF_RENDER_PROTOCOL_VERSION`, `RenderRequest`, `validateRenderRequest`, and `fingerprintRenderRequest` unchanged; do not add `renderPdf` here.

**Acceptance:** Equivalent inputs normalize identically; every render-affecting change invalidates the fingerprint.

**Targeted verification:** Focused core unit tests for defaults, invalid paths, compatibility and fingerprints.

### L17-S03 — `feat(templates): define renderable template contracts`

- [ ] Extend `TemplateDescriptor<TData>` as `RenderableTemplate<TData>` with a plan factory and a `fixed | flow | continuous` discriminant that wraps the existing two advanced plan types.
- [ ] Cover the actual six-family, 18-template catalog in the new metadata union without altering legacy unions.
- [ ] Add an additive adapter for one fixed current template without changing its visual composition.
- [ ] Qualify flow with the existing `ComponentDocument`/`DocumentFrame` specimen and continuous behavior with the feasibility fixture; do not adapt a catalog receipt in L17.
- [ ] Preserve every adapted component export and keep static trusted template resolution possible for L18.
- [ ] Give plan factories a bounded context containing the frozen resolved theme and a separate legacy-style projection; adapters apply only colors and qualified family changes, never type scale, spacing, weights, or geometry.

**Acceptance:** Fixed, flow, and continuous evidence satisfies one generic contract, the current template adapter preserves its component export, and no catalog receipt geometry or version changes.

**Targeted verification:** Typecheck plus focused schema/default/adapter tests; one existing PDF smoke per plan kind only if adapter code affects composition.

### L17-S04 — `test(api): qualify compatibility adapters and migration boundaries`

- [ ] Prove that legacy `style` and flattened props remain callable during the declared transition.
- [ ] Record which public fields require a future major removal and which changes are additive.
- [ ] Prove that protocol V1 and advanced plan/theme exports remain callable and unchanged.
- [ ] Do not call, type, or test `renderPdf`; that public facade and protocol V2 belong to L18.
- [ ] Update the L17 QA evidence and status without claiming catalog migration.

**Acceptance:** L18 can consume the contract, while current consumers receive no undocumented break.

**Targeted verification:** Public export/type fixture and targeted compatibility tests; no full catalog render.

## Exit criteria

The unified contract is locally verified, a fixed adapter plus the existing flow and continuous feasibility specimens cover the three plan kinds, and unresolved API choices are closed in documentation. No template-family refactor, receipt geometry migration, render facade, worker V2, or Theme Studio UI belongs here.

Update [status](../status.json) and create `docs/qa/L17.md` from the QA template. Local verification does not authorize merge, deployment or publication.

## Out of scope

No renderer facade, table/graph enhancement, catalog-wide migration, website configurator, immutable registry replacement or legacy API removal.
