# ADR 0006 — One template contract and rendering facade

Date: 2026-09-12. Status: accepted for the post-V1 L17–L22 program.

## Context

The V1 repository contains strong but disconnected capabilities: strict render-request validation, physical formats, print-profile finalization, qualified local fonts, PDF themes, Node/browser adapters, source-owned templates and a component registry. The 18 shipped templates do not use one public template contract. They expose flattened component props plus template-specific `style`, resolve formats and languages internally, and are rendered by examples that often call React PDF directly. `RenderRequest` and `RenderResult` therefore describe guarantees that the normal template examples do not orchestrate end to end.

The competitive audit found that a simpler product can expose one component or block with one theme input while keeping substantial internal complexity. docn-ui should adopt that clarity without adopting mutable global themes, floating-point monetary calculations, remote font loading or unvalidated output.

## Decision

Introduce a non-React `TemplateDescriptor<TData>` containing metadata, a strict schema, defaults, compatibility and permitted asset extraction. `RenderableTemplate<TData>` extends that descriptor with fixed, flow or continuous plan creation. The plan union wraps the existing `FixedDocumentRenderPlan` and `ContinuousDocumentRenderPlan` names; it does not replace them. Node and browser entry points both export:

```ts
renderPdf(
  template,
  { data, theme?, format?, locale?, printProfile?, revision? },
  runtimeOptions?,
): Promise<RenderResult>
```

The normal path automatically validates inputs, resolves defaults, registers qualified local fonts, creates the correct plan, renders, applies print finalization, enforces limits and returns structured results. Advanced primitives, React compositions and plan-level render functions remain available outside the quick start.

Use one public `theme` option accepting a `ThemeId`, a structurally exact preset `PdfTheme`, or a validated `CustomPdfTheme`. `PdfTheme`, `themes`, `getPdfTheme`, and the advanced `createPdfTheme(themeId, overrides)` overload remain unchanged. The additive safe overload is `createPdfTheme({ baseThemeId, colors?, fonts? })`; it returns a complete custom theme whose `id` equals `baseThemeId`. A bare `PdfTheme` without `baseThemeId` is accepted only when deeply equal to `themes[theme.id]`. Compatibility first checks the base against the template's `supportedThemeIds`, then validates its declared envelope. The initial cross-template envelope permits color-role changes only. A template may opt in to specific manifest-qualified body or heading families only after explicit overflow and page-count qualification. Weights, type scale, and spacing remain identical to the base preset. Keep `printProfile` separate because it controls physical output rather than visual identity. Theme resolution deep-clones and deep-freezes the result before fingerprinting; no mutable global theme state is introduced.

Use a discriminated format input: preset and continuous `FormatId` strings exclude `label-custom`; that format requires `{ id: "label-custom", widthMm, heightMm, orientation? }`. Presets never accept dimensions. Custom dimensions are validated before orientation is applied, matching the released `resolveFormat` order. Each descriptor owns a `defaultFormatId` that must occur in its supported set.

The caller or render coordinator owns revisions. A supplied positive revision is copied unchanged into `RenderResult`; a direct one-shot call that omits it uses 1. The worker drops stale completions and interrupts or replaces superseded work. The UI marks a retained last-valid result stale when its revision differs from current input. Do not add a `stale` field or rename the existing `RenderResult` fields.

Keep qualified font assets and local document images on separate paths. Fonts use the fixed manifest and explicit binary preparation. Template data carries only canonical local image IDs. After data validation, extraction deduplicates and sorts those IDs and applies the two-image limit. A platform-specific resolver in `runtimeOptions` supplies bytes and declared PNG/JPEG MIME type to shared asynchronous preflight. Preflight sniffs and decodes the content, verifies the declaration, recomputes SHA-256 and emits pure descriptors `{ id, mimeType, byteLength, widthPx, heightPx, sha256 }`; its descriptor set must exactly match the extracted IDs. Pure normalization fingerprints the sorted descriptors. Worker transfer sends validated `ArrayBuffer`s separately from serializable input, and temporary worker URLs are always revoked. No arbitrary image URL or filesystem path enters template data.

L17 does not alter `PDF_RENDER_PROTOCOL_VERSION = 1`, `RenderRequest`, `validateRenderRequest`, or `fingerprintRenderRequest`. L18 introduces protocol V2. The browser coordinator keeps `RenderableTemplate`, Zod, `createPlan`, `runtimeOptions`, and resolvers out of `postMessage`; the worker resolves a trusted template from a static ID-to-loader map.

Add explicit bounded table support outside `DocumentFrame`, grouped-bar/multi-series Graph data and any other minimal composition capability proven necessary by the template matrix before migrating templates. Then migrate all 18 templates and qualify the installed source in isolated Node and browser consumers. Flow qualification uses the existing `ComponentDocument`/`DocumentFrame` specimen unless a template migration explicitly changes and versions its geometry.

## Consequences

- Consumers no longer need React PDF, font registration, format resolution, asset resolvers or render-plan construction in the primary example.
- Validation, local assets, bounded rendering, physical geometry, print boxes and fingerprints remain observable guarantees rather than optional guidance.
- The complete resolved theme must participate in normalization and fingerprinting. L18 protocol V2 carries its serializable representation without mutating protocol V1.
- The worker protocol V2 is interruptible and transfers validated image bytes separately from the serializable render request.
- Existing flattened props, `style` overrides and renderer functions require additive adapters and deprecation guidance. Their removal is a major-version decision.
- A template installed alone remains source-owned. The render facade is another visible registry item, not a hidden package or service.
- Theme Studio cannot expose weight, type-scale or spacing controls in its initial geometry-safe scope. It exports `~/docn/themes/<safe-name>.ts` with a relative import and compilation evidence, never `eval`.

## Rejected alternatives

- **Keep documentation-only conventions:** this would preserve the current mismatch between contracts and examples.
- **Put validation and font setup in every template:** this would duplicate infrastructure eighteen times and make updates unsafe.
- **Create a universal browser/Node module:** platform imports would leak filesystem or browser dependencies into the wrong bundle.
- **Make print settings theme tokens:** this would mix visual identity with physical production and produce misleading theme exports.
- **Adopt permissive arbitrary theme/font values:** this would weaken reproducibility and glyph guarantees.
- **Migrate only three showcase templates:** a pilot is useful evidence, but it would leave the catalog teaching multiple incompatible APIs.

## Authorization boundary

This decision authorizes the documented local implementation sequence requested by the maintainer. It does not authorize merging, deployment, a new public version, npm publication, registry-directory submission, domain work or removal of immutable published artifacts.
