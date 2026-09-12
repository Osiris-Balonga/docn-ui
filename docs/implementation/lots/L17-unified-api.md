# L17 — Unified template and theme contract

Initial status: **planned**. Proposed branch: `feat/unified-template-api`.

Dependencies: L16. Requirements: FR-18, FR-20, NFR-12; ADR 0006.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md), [agent rules](../../../AGENTS.md), [ADR 0006](../../adr/0006-unified-template-rendering-api.md), [document model](../../specs/DOCUMENT_MODEL.md), [template catalog](../../specs/TEMPLATE_CATALOG.md) and the observed L16 exit evidence. L16 must have reached its truthful terminal state before this post-V1 branch begins. A released state is not assumed.

## Scope and files

Define the public contract before changing template layouts. Reconcile the current theme, template metadata, request/result and compatibility surfaces. Introduce additive adapters for one fixed template and one continuous template, and use the existing `ComponentDocument`/`DocumentFrame` specimen for flow-contract evidence; do not claim a current catalog template is flowing or migrate the catalog in this lot.

Target responsibilities: `packages/documents/src/core`, `themes`, template contracts, focused contract tests, public exports and API documentation.

## Stories and commits in order

### L17-S01 — `docs(api): specify the unified template and theme contract`

- [ ] Specify `RenderableTemplate<TData>`, normalized inputs, defaults, compatibility and fixed/flow/continuous plan kinds.
- [ ] Fix the public call as `renderPdf(template, { data, theme?, format?, locale?, printProfile?, revision? }, runtimeOptions?)`; prohibit a nested `options` object.
- [ ] Specify `theme` as `ThemeId | PdfTheme`, require custom themes to carry `baseThemeId`, define per-template compatibility envelopes, and keep `printProfile` separate.
- [ ] Separate fixed font-manifest assets from bounded local document-image IDs and the platform resolver supplied through `runtimeOptions`.
- [ ] Define legacy-request and legacy-template compatibility boundaries, including the protocol-version consequence of serializing a complete theme.

**Acceptance:** Reviewers can implement the contract without deciding new public names or silently weakening a V1 guarantee.

**Targeted verification:** Documentation link and terminology review; no application suite.

### L17-S02 — `feat(core): normalize unified render inputs`

- [ ] Resolve defaults and validate theme, `baseThemeId`, the template envelope, format, locale, print profile, bounded data and compatibility before composition.
- [ ] Fingerprint the normalized complete input, including the resolved theme, font manifest identity and validated local-image digests.
- [ ] Keep the existing `RenderResult` names: `pdfBytes`, `finalDimensions`, `pageCount`, `diagnostics`, `fingerprint` and `revision`.
- [ ] Preserve structured paths and stable error codes.

**Acceptance:** Equivalent inputs normalize identically; every render-affecting change invalidates the fingerprint.

**Targeted verification:** Focused core unit tests for defaults, invalid paths, compatibility and fingerprints.

### L17-S03 — `feat(templates): define renderable template contracts`

- [ ] Add typed metadata, strict schema, defaults, permitted local-image ID extraction, theme envelope and plan creation contracts.
- [ ] Cover the actual six-family, 18-template catalog in the metadata unions.
- [ ] Add additive adapters for one fixed and one continuous current template without changing visual composition; qualify the flow shape with the existing component specimen.

**Acceptance:** The three adapters satisfy one generic contract and preserve their existing component exports.

**Targeted verification:** Typecheck plus focused schema/default/adapter tests; one existing PDF smoke per plan kind only if adapter code affects composition.

### L17-S04 — `test(api): qualify compatibility adapters and migration boundaries`

- [ ] Prove that legacy `style` and flattened props remain callable during the declared transition.
- [ ] Record which public fields require a future major removal and which changes are additive.
- [ ] Update the L17 QA evidence and status without claiming catalog migration.

**Acceptance:** L18 can consume the contract, while current consumers receive no undocumented break.

**Targeted verification:** Public export/type fixture and targeted compatibility tests; no full catalog render.

## Exit criteria

The unified contract is locally verified, fixed and continuous adapters plus the existing flow specimen cover the three plan kinds, and unresolved API choices are closed in documentation. No template-family refactor or Theme Studio UI belongs here.

Update [status](../status.json) and create `docs/qa/L17.md` from the QA template. Local verification does not authorize merge, deployment or publication.

## Out of scope

No renderer facade, table/graph enhancement, catalog-wide migration, website configurator, immutable registry replacement or legacy API removal.
