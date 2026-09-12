# ADR 0006 — One template contract and rendering facade

Date: 2026-09-12. Status: accepted for the post-V1 L17–L22 program.

## Context

The V1 repository contains strong but disconnected capabilities: strict render-request validation, physical formats, print-profile finalization, qualified local fonts, PDF themes, Node/browser adapters, source-owned templates and a component registry. The 18 shipped templates do not use one public template contract. They expose flattened component props plus template-specific `style`, resolve formats and languages internally, and are rendered by examples that often call React PDF directly. `RenderRequest` and `RenderResult` therefore describe guarantees that the normal template examples do not orchestrate end to end.

The competitive audit found that a simpler product can expose one component or block with one theme input while keeping substantial internal complexity. docn-ui should adopt that clarity without adopting mutable global themes, floating-point monetary calculations, remote font loading or unvalidated output.

## Decision

Introduce a generic `RenderableTemplate<TData>` definition containing metadata, a strict schema, defaults, compatibility, permitted asset extraction and fixed, flow or continuous plan creation. Node and browser entry points both export:

```ts
renderPdf(
  template,
  { data, theme?, format?, locale?, printProfile?, revision? },
  runtimeOptions?,
): Promise<RenderResult>
```

The normal path automatically validates inputs, resolves defaults, registers qualified local fonts, creates the correct plan, renders, applies print finalization, enforces limits and returns structured results. Advanced primitives, React compositions and plan-level render functions remain available outside the quick start.

Use one public `theme` option accepting a `ThemeId` or validated `PdfTheme`. A custom `PdfTheme` records `baseThemeId`; compatibility first checks that base against the template's `supportedThemeIds`, then validates its declared theme envelope. The initial cross-template envelope permits color roles and qualified body/heading family changes but fixes weights, type scale and spacing to the base preset. `createPdfTheme` is the customization and Theme Studio export contract. Keep `printProfile` separate because it controls physical output rather than visual identity. Theme resolution remains immutable and scoped to a render; no mutable global theme state is introduced.

The caller or render coordinator owns revisions. A supplied positive revision is copied unchanged into `RenderResult`; a direct one-shot call that omits it uses 1. The worker drops stale completions and interrupts or replaces superseded work. The UI marks a retained last-valid result stale when its revision differs from current input. Do not add a `stale` field or rename the existing `RenderResult` fields.

Keep qualified font assets and local document images on separate paths. Fonts use the fixed manifest and explicit binary preparation. Template data carries only image IDs; a platform-specific resolver in `runtimeOptions` validates local PNG/JPEG bytes, dimensions, size and digest. Worker transfer sends the validated bytes separately from the serializable render request. No arbitrary image URL or filesystem path enters template data.

Add explicit bounded table support outside `DocumentFrame`, grouped-bar/multi-series Graph data and any other minimal composition capability proven necessary by the template matrix before migrating templates. Then migrate all 18 templates and qualify the installed source in isolated Node and browser consumers. Flow qualification uses the existing `ComponentDocument`/`DocumentFrame` specimen unless a template migration explicitly changes and versions its geometry.

## Consequences

- Consumers no longer need React PDF, font registration, format resolution, asset resolvers or render-plan construction in the primary example.
- Validation, local assets, bounded rendering, physical geometry, print boxes and fingerprints remain observable guarantees rather than optional guidance.
- The complete resolved theme must participate in normalization and fingerprinting. A worker request carrying custom themes requires a new protocol version.
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
