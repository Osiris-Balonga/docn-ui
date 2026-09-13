# Document source architecture

`@docn-ui/documents` is a private authoring workspace, not a published runtime package. The future shadcn registry copies selected source files and their declared assets into a consumer project. It must not copy feasibility fixtures or depend on the documentation website.

## Entry points

| Entry point                                           | Responsibility                                                                             | Runtime boundary                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `@docn-ui/documents/core`                             | Serializable render contracts, formats, validation, units, limits, and input fingerprints  | No React, browser, Node filesystem, DOM, or CSS               |
| `@docn-ui/documents/themes`                           | The three PDF token sets                                                                   | Core only; hex colors and point values, no website tokens     |
| `@docn-ui/documents/primitives`                       | Fixed/flow PDF frames, shared theme access, composition primitives and measurement helpers | React and `@react-pdf/renderer`; no site imports              |
| `@docn-ui/documents/templates/business-card-coral-qr` | One source-owned business-card composition and definition                                  | Core, themes, primitives, and React-pdf only; no site imports |
| `@docn-ui/documents/browser`                          | Unified browser `renderPdf` facade, advanced fixed adapter, and same-origin asset resolver | React-pdf browser renderer and manifest assets                |
| `@docn-ui/documents/node`                             | Unified Node `renderPdf` facade, advanced plan adapters, and verified local-asset resolver | React-pdf Node renderer and pdf-lib box finalization          |
| `@docn-ui/documents`                                  | Node-oriented convenience surface for repository tooling                                   | Core, themes, manifest, measurement, and Node adapter         |
| `@docn-ui/documents/feasibility/browser`              | Hidden L02/L04 qualification page only                                                     | Internal evidence; never a registry dependency                |

## Unified contract layers

L17 implemented these additive layers:

- S02 adds a non-React template-contract layer above `core` and `themes`. It
  owns JSON-constrained `TemplateDescriptor<TData>`, the canonical 18-ID tuple,
  exact normalization/fingerprint contracts, print-profile compatibility, and
  pure normalization of already-preflighted image descriptors. Caller data is
  mandatory; descriptor defaults/examples are validated fixtures, never render
  fallbacks. Validation inspects raw JSON, parses once, then inspects schema
  output without rerunning transforms. `core` gains no dependency on themes or
  assets.
- S03 extends that descriptor as `RenderableTemplate<TData>` with a plan
  factory. Its `fixed | flow | continuous` union wraps the existing
  `FixedDocumentRenderPlan` and `ContinuousDocumentRenderPlan` APIs without
  renaming them. The plan context separates the full frozen theme from the
  optional differential colors/qualified-family projection allowed for legacy
  style props and consumes only runtime-owned resolved image sources.
- The released React `TemplateDefinition` used by the catalog/generator remains
  a separate compatibility surface. It is not an alias for the new descriptor
  or renderable contract.
- Browser workers resolve a template from a static trusted ID map. A
  `RenderableTemplate`, Zod schema, plan factory, runtime option, or local-image
  resolver never crosses `postMessage`; V2 carries JSON and separate
  private-copy `ArrayBuffer` transfers only. The runtime owns resolved-image
  lookup creation and cleanup.

Templates depend on core, themes, primitives, and an explicit renderer entry. They never import Next.js, shadcn/ui, Tailwind, site CSS, or a user-provided module path. `pdfjs-dist` remains in the feasibility/inspection path; it is not required by the reusable fixed-document Node adapter.

## Frame composition

`PageFrame` keeps the existing fixed safe-area and print-profile contract. `DocumentFrame` is a wrapping A4/Letter Page for normal-flow content, with explicit theme and repeated header/footer reservations. It currently uses trim-sized screen geometry, not bleed/crop profiles. All dimensions supplied to its margin/region props are points. Use the individual source modules for new compositions; `primitives/index.tsx` remains the compatibility facade. Source-only theme context does not register fonts or inherit site CSS. See the [frame contract](../../docs/specs/COMPONENT_CATALOG.md#s02a-frame-api-decision) before building a non-breaking group.

## Assets

`assets/manifest.json` is the inventory for distributable binaries. Every entry has a stable ID, fixed local/public path, byte size, SHA-256 hash, source package, and license file. Browser and Node resolvers accept only these IDs. User data cannot select a URL or filesystem path. The website build copies manifest fonts to the same-origin static directory; document rendering performs no font download.

Registry work in L07 must derive item files and binary declarations from the same source tree and manifest. Feasibility fixtures, QA artifacts, website components, and generated output are excluded.

## Unified Node and browser rendering

The Node entry now owns the normal orchestration path without requiring a
consumer to import React, React PDF, format resolution, font registration, or
render-plan helpers:

```ts
import { renderPdf } from "@docn-ui/documents/node";

const result = await renderPdf(template, {
  data,
  theme: "neutral",
  revision: 4,
});
```

Browser consumers use the same call shape from
`@docn-ui/documents/browser`. Its optional `fontAssetBaseUrl` defaults to
`globalThis.location.origin`; an explicit string or `URL` must resolve to the
same HTTP(S) origin and cannot contain credentials. Before rendering, the
browser facade fetches every manifest font with redirects disabled, verifies
the declared `Content-Length` when present, streams no more than the manifest
byte length, verifies SHA-256, snapshots the result as a data URI, and
temporarily prioritizes only those verified sources in React PDF's global font
store. A trusted source invalidated by `Font.reset()` is repaired in place.
Earlier advanced registrations are restored after the awaited facade render,
and facade renders are serialized around that temporary ordering.

`result` retains the released `RenderResult` fields. An omitted revision is
`1`; a supplied positive revision is copied unchanged. The optional
`fontAssetDirectory` points to a complete local copy of the qualified manifest
assets. Every file remains contained below that directory and must match its
recorded byte length and SHA-256 digest. There is no system-font or network
fallback. The verified bytes become an immutable data source before rendering;
the facade-owned React PDF source never reopens the configured filesystem path.
Because the pinned React PDF engine uses a process-global first-match font
store, the facade temporarily promotes its own digest-bound source for each
qualified family, weight, and style while rendering, then restores the earlier
source order. Existing advanced registrations, including already cached or
mismatched sources, cannot be selected by the facade and remain unchanged for
later advanced renders. Registration is cache-aware, so repeated renders do not
accumulate duplicate facade sources, and a facade source invalidated by
`Font.reset()` is repaired in place. If advanced code populated the registration
cache with the same canonical data URI first, the facade creates one owned
source and reuses it thereafter. `Font.clear()` removes the
engine's standard font setup and is outside the facade contract. Facade renders
are serialized, but concurrent mixed advanced/facade rendering is unsupported
because advanced calls share the same global store.

Template data may carry validated local-image IDs, never paths or URLs. The
optional `localImageResolver` returns owned PNG/JPEG bytes and a declared MIME
type at runtime. The facade decodes bounded pixels, applies EXIF orientation,
normalizes metadata, fingerprints the final descriptor, and releases the
plan-facing browser object URLs after success or failure. PNG pixels and rotated
JPEG pixels become deterministic metadata-free PNGs. An unrotated JPEG keeps its
compressed image stream while bounded metadata segments are removed, avoiding
an unbounded JPEG-to-PNG size increase. L18-S04 remains responsible for worker
supersession, timeout and termination cleanup because those lifecycle events do
not exist in the direct one-shot S02 call.

Continuous plans are screen-only and use the plan's qualified non-empty final
marker, bounded to 256 characters. The facade renders a maximum-height probe,
measures the complete final glyph bounds, and renders once more at that raw
extent plus the single 12 pt layout allowance from ADR 0003. Browser measurement
uses an explicit package-local PDF.js worker and destroys the loading task, PDF
worker, and underlying browser worker after each measurement; it is not the
interactive render protocol V2 planned for L18-S04. Final `pageCount` and
`finalDimensions` are inspected from the actual returned PDF for fixed, flow,
and continuous plans. A continuous final PDF is accepted only when it remains
one page within its qualified width/height bounds and its marker is the last,
lowest relevant text. Unexpected plan, renderer, measurement, and finalization
failures become a constant `RENDER_FAILED` validation issue at `document`;
existing structured validation failures retain their code and path, and raw
error text or document data is never copied into the public error.

The package currently distributes TypeScript source. Use the `./node` subpath
through a TypeScript-aware loader or bundler, as the qualified registry consumer
does before invoking Node. Native `node --experimental-strip-types` is not a
supported execution path: it does not resolve the source tree's extensionless
TypeScript imports, and this lot does not rewrite stable V1 module specifiers.
