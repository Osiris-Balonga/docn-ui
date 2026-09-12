# ADR 0006 — One template contract and rendering facade

Date: 2026-09-12. Status: accepted for the post-V1 L17–L22 program.

## Context

The V1 repository contains strong but disconnected capabilities: strict render-request validation, physical formats, print-profile finalization, qualified local fonts, PDF themes, Node/browser adapters, source-owned templates and a component registry. The 18 shipped templates do not use one public template contract. They expose flattened component props plus template-specific `style`, resolve formats and languages internally, and are rendered by examples that often call React PDF directly. `RenderRequest` and `RenderResult` therefore describe guarantees that the normal template examples do not orchestrate end to end.

The competitive audit found that a simpler product can expose one component or block with one theme input while keeping substantial internal complexity. docn-ui should adopt that clarity without adopting mutable global themes, floating-point monetary calculations, remote font loading or unvalidated output.

## Decision

Introduce exact `JsonValue`/`JsonObject` types and constrain `TemplateDescriptor<TData extends JsonObject>` to JSON document data. Its strict schema, explicit default/example fixtures, compatibility and permitted asset extraction are non-React. Caller `data` remains mandatory; defaults/examples are never render fallbacks or merge inputs. Schema outputs and both fixtures pass through `inspectDocumentData` after parsing. `RenderableTemplate<TData>` extends that descriptor with fixed, flow or continuous plan creation. The plan union wraps the existing `FixedDocumentRenderPlan` and `ContinuousDocumentRenderPlan` names; it does not replace them. A canonical `TEMPLATE_IDS` tuple defines the 18-ID union and is asserted as an exact, duplicate-free bijection against current definitions and catalog entries. Partial adapter/loader maps accept only unique members; L20 applies the exact-set assertion after all 18 descriptors migrate. Node and browser entry points both export:

```ts
renderPdf(
  template,
  { data, theme?, format?, locale?, printProfile?, revision? },
  runtimeOptions?,
): Promise<RenderResult>
```

The normal path automatically validates required data, resolves only the declared optional format/theme/locale/print-profile/revision defaults, registers qualified local fonts, creates the correct plan, renders, applies print finalization, enforces limits and returns structured results. Advanced primitives, React compositions and plan-level render functions remain available outside the quick start.

Use one public `theme` option accepting a `ThemeId`, a structurally exact preset `PdfTheme`, or a validated `CustomPdfTheme`. `PdfTheme`, `themes`, `getPdfTheme`, and the advanced `createPdfTheme(themeId, overrides)` overload remain unchanged. The additive safe overload is `createPdfTheme({ baseThemeId, colors?, fonts? })`; it returns a complete custom theme whose `id` equals `baseThemeId`. A bare `PdfTheme` without `baseThemeId` is accepted only when deeply equal to `themes[theme.id]`. Compatibility first checks the base against the template's `supportedThemeIds`, then validates its declared envelope. The initial cross-template envelope permits color-role changes only. A template may opt in to specific manifest-qualified body or heading families only after explicit overflow and page-count qualification. Weights, type scale, and spacing remain identical to the base preset. Keep `printProfile` separate because it controls physical output rather than visual identity. Theme resolution deep-clones and deep-freezes the result before fingerprinting; no mutable global theme state is introduced.

Use a discriminated format input: preset and continuous `FormatId` strings exclude `label-custom`; that format requires `{ id: "label-custom", widthMm, heightMm, orientation? }`. Presets never accept dimensions. Custom dimensions are validated before orientation is applied, matching the released `resolveFormat` order. Each descriptor owns a `defaultFormatId` that must occur in its supported set. It also declares `supportedPrintProfileKinds` and a compatible default. The L17 continuous feasibility descriptor is screen-only; no unsupported print profile is silently ignored.

The caller or render coordinator owns revisions. A supplied positive revision is copied unchanged into `RenderResult`; a direct one-shot call that omits it uses 1. The worker drops stale completions and interrupts or replaces superseded work. The UI marks a retained last-valid result stale when its revision differs from current input. Do not add a `stale` field or rename the existing `RenderResult` fields.

Keep qualified font assets and local document images on separate paths. Fonts use the fixed manifest and explicit binary preparation. Template data carries only canonical local image IDs. After data validation, extraction deduplicates and sorts those IDs and applies the two-image limit. A platform-specific resolver in `runtimeOptions` supplies bytes and an untrusted declared PNG/JPEG MIME type to `preflightLocalImages`. Preflight sniffs and decodes the content, verifies the declaration, recomputes SHA-256 and emits `PreparedLocalImages` containing pure descriptors `{ id, mimeType, byteLength, widthPx, heightPx, sha256 }`; its descriptor set must exactly match the extracted IDs. `NormalizationContext` contains only the descriptor projection and exact `FontManifestIdentity`. `normalizeTemplateInput` is pure, and `fingerprintNormalizedTemplateInput` fingerprints the frozen normalized input. Worker transfer sends validated `ArrayBuffer`s separately from serializable input, and temporary worker URLs are always revoked. No arbitrary image URL or filesystem path enters template data.

The full resolved theme supplies identity, colors, base-preserving weights/type scale/spacing, and any qualified family choices to public components. `TemplatePlanContext` separately exposes a legacy-style projection. Adapters may map only its colors and template-qualified body/heading family changes into source-owned `style` props; they cannot map weights, type scale, spacing, or geometry.

L17 does not alter `PDF_RENDER_PROTOCOL_VERSION = 1`, `RenderRequest`, `validateRenderRequest`, or `fingerprintRenderRequest`. L18 creates the generic coordinator and protocol V2; V1 remains the historical feasibility path. Exact `NodeRenderRuntimeOptions` and `BrowserRenderRuntimeOptions` keep asset locations and image resolvers outside the protocol. The browser coordinator keeps `RenderableTemplate`, Zod, `createPlan`, `runtimeOptions`, resolvers, functions, and platform objects out of `postMessage`; the worker resolves a trusted template from a static ID-to-loader map.

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
