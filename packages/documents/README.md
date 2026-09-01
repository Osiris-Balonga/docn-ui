# Document source architecture

`@docn-ui/documents` is a private authoring workspace, not a published runtime package. The future shadcn registry copies selected source files and their declared assets into a consumer project. It must not copy feasibility fixtures or depend on the documentation website.

## Entry points

| Entry point | Responsibility | Runtime boundary |
| --- | --- | --- |
| `@docn-ui/documents/core` | Serializable render contracts, formats, validation, units, limits, and input fingerprints | No React, browser, Node filesystem, DOM, or CSS |
| `@docn-ui/documents/themes` | The three PDF token sets | Core only; hex colors and point values, no website tokens |
| `@docn-ui/documents/primitives` | Fixed/flow PDF frames, shared theme access, composition primitives and measurement helpers | React and `@react-pdf/renderer`; no site imports |
| `@docn-ui/documents/templates/business-cards` | Typed business-card schemas, metadata, examples, and render plans | Core, themes, primitives, and React-pdf only; no site imports |
| `@docn-ui/documents/browser` | Browser fixed-document adapter and same-origin asset resolver | React-pdf browser renderer and manifest assets |
| `@docn-ui/documents/node` | Node fixed-document adapter and absolute-path asset resolver | React-pdf Node renderer and pdf-lib box finalization |
| `@docn-ui/documents` | Node-oriented convenience surface for repository tooling | Core, themes, manifest, measurement, and Node adapter |
| `@docn-ui/documents/feasibility/browser` | Hidden L02/L04 qualification page only | Internal evidence; never a registry dependency |

Templates depend on core, themes, primitives, and an explicit renderer entry. They never import Next.js, shadcn/ui, Tailwind, site CSS, or a user-provided module path. `pdfjs-dist` remains in the feasibility/inspection path; it is not required by the reusable fixed-document Node adapter.

## Frame composition

`PageFrame` keeps the existing fixed safe-area and print-profile contract. `DocumentFrame` is a wrapping A4/Letter Page for normal-flow content, with explicit theme and repeated header/footer reservations. It currently uses trim-sized screen geometry, not bleed/crop profiles. All dimensions supplied to its margin/region props are points. Use the individual source modules for new compositions; `primitives/index.tsx` remains the compatibility facade. Source-only theme context does not register fonts or inherit site CSS. See the [frame contract](../../docs/specs/COMPONENT_CATALOG.md#s02a-frame-api-decision) before building a non-breaking group.

## Assets

`assets/manifest.json` is the inventory for distributable binaries. Every entry has a stable ID, fixed local/public path, byte size, SHA-256 hash, source package, and license file. Browser and Node resolvers accept only these IDs. User data cannot select a URL or filesystem path. The website build copies manifest fonts to the same-origin static directory; document rendering performs no font download.

Registry work in L07 must derive item files and binary declarations from the same source tree and manifest. Feasibility fixtures, QA artifacts, website components, and generated output are excluded.
