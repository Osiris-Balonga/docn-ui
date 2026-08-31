# PDF component catalog — PDFx comparison and L12 contract

Date: 2026-08-31. Status: **planned**, not an availability claim. The maintainer requested component availability and documentation before further template redesign. L12 must cover the component categories below and add barcodes. Existing template compositions remain unchanged during this work, except for necessary, behavior-preserving imports.

## Evidence and scope

The reference is [PDFx by akii09](https://github.com/akii09/pdfx), not the unrelated PDFX products or the PDF/X print standard. Its [published registry](https://pdfx.akashpise.dev/r/index.json) and [source registry at commit 4b5c8df](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/registry/index.json) both list 24 component entries on the inspection date. Neither lists Barcode. This observation is limited to those inventories; it is not a claim that PDFx cannot be extended to render one.

The comparison also inspected PDFx's public prop references for [Heading](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/heading.constant.ts), [Text](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/text.constant.ts), [Form](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/form.constant.ts), [Graph](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/graph.constant.ts), [List](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/list.constant.ts), [Signature](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/signature.constant.ts), and [QRCode](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/qrcode.constant.ts). Inventory coverage is not API or visual parity: each component needs its own typed contract and examples before it is advertised.

Local baseline: `a9a5dc582575c90c216817c78570c65892b5eb8f` on `feat/invoice-templates`. [Primitive sources](../../packages/documents/src/primitives/index.tsx) expose nine JSX components and three [flow-table helpers](../../packages/documents/src/primitives/table.tsx). The [site index](../../apps/www/src/app/(site)/components/page.tsx) lists nine names as non-interactive text; no component detail routes exist. The [registry manifest](../../tooling/registry/source-manifest.mjs) installs primitives as one `docn-primitives` item. Thus, source existence does not yet mean that a developer can discover and install an individual component from its documentation.

## Coverage matrix

"Existing" below means a related implementation exists, not that all PDFx options are supported. No item in this matrix is a completed L12 deliverable yet.

| PDFx component | docn-ui baseline | Required L12 outcome |
| --- | --- | --- |
| Alert | Missing | Titled callout, explicit status text, optional supporting content; neutral default. |
| Badge | Missing | Compact status label, size and tone options; no reliance on color alone. |
| Card | Missing | Composable content container with optional heading and controlled padding. |
| DataTable | Missing | Typed columns and rows built on the same table primitives, not a second layout engine. |
| Divider | Existing `Separator` | Document horizontal separation; retain `Separator` and expose a discoverable `Divider` alias without duplicate implementation. |
| Form | Missing | Printable labeled fields and grouped one/two/three-column layouts; blank or populated values. Not interactive AcroForms. |
| Graph | Missing | Bar, horizontal bar, line, area, pie, and donut; PDF-native vector output, labels and legends. |
| Heading | Existing, two named sizes | Level hierarchy, alignment and safe style controls; keep existing `display`/`heading` usages working. |
| KeepTogether | Only inline `wrap={false}` usage | Explicit bounded grouping for flowing pages, with documented oversized-content behavior. |
| KeyValue | Existing vertical `FieldPair` | Horizontal/vertical label-value layout; keep `FieldPair` compatible and share implementation. |
| Link | Missing | PDF link annotations and readable text; validated HTTP(S), mailto, tel, or explicit internal destinations. |
| List | Missing | Bullets, numbering, nesting, descriptive entries and static check states; bounded depth and length. |
| PageBreak | Engine behavior only | Explicit page break for flowing content, documented separately from a fixed-format frame. |
| PageFooter | Invoice-specific inline layout | Reusable inline/repeated footer with reserved space, optional contact information and page numbering. |
| PageHeader | Invoice-specific inline layout | Reusable inline/repeated header with optional resolved logo and reserved space. |
| PageNumber | Invoice-specific render callback | Current/total page numbering resolved after pagination, with configurable text. |
| Image | Existing resolved-source image | Controlled fit, size, caption and alignment using permitted local assets; no arbitrary user URL fetch. |
| QRCode | Existing vector QR and density validation | Document and expose the existing implementation; retain the four-module quiet zone and final-PDF decoding checks. |
| Section | Missing | Logical content group with heading and spacing; no universal layout component with dozens of flags. |
| Signature | Missing | One/two signer areas and inline signature field; optional name/date/role. Not a digital signature. |
| Stack | Existing vertical stack; separate `Row` | Document vertical/horizontal composition and token-based spacing, preserving both existing APIs. |
| Table | Partial `FlowTableHeader/Row/Cell` | Composable table surface, headers/cells, alignment and predictable pagination; preserve existing invoice helpers. |
| Text | Existing string-only text | Paragraph and inline typography, alignment and available font weights; explicit font/style limits. |
| Watermark | Missing | Restrained text overlay with opacity, placement and repeat behavior; not document protection. |

Seven categories have an existing counterpart, one has partial table helpers, and sixteen lack a reusable public component. That count deliberately does not treat template-local headers and footers as finished primitives.

The objective is equivalent document-building capability with docn-ui contracts, not drop-in compatibility with PDFx imports or a copy of every decorative variant. A narrower behavior must be documented and explicitly accepted before claiming that category complete. Do not copy PDFx source, brand assets, examples, CLI, theme configuration, or its permissive input behavior as an implementation shortcut. Any future source reuse needs attribution and a separate license review.

## Additional docn-ui capabilities

### Barcode — requested addition

The initial proposed symbologies are Code 128 for internal identifiers and EAN-13 for product identifiers. Implement them as one explicitly typed component with format-specific validation, not an unrestricted encoder-options object. Do not silently choose a different format or truncate a value.

- Emit native PDF vector bars from a reviewed local encoder adapter, not a network service or a screenshot.
- Define payload limits, module width, bar height, quiet zones, and optional readable text in physical units. Reject a requested size that cannot preserve those constraints.
- Validate EAN-13 length and check digit, and document whether the API accepts twelve-digit input with explicit check-digit calculation. Do not imply that producing a symbol assigns a GS1 identifier.
- Decode rasterizations of the final PDFs with an independent decoder. Cover one nominal value per symbology plus the distinct invalid-input/density cases, not a format/theme/locale Cartesian product.
- Keep the barcode encoder out of Text-only installation and out of the initial catalog bundle.
- Record library version, license, transitive notices and measured bundle cost before adding a dependency. [bwip-js](https://bwip-js.metafloor.com/) is a candidate with cross-platform vector/custom-drawing support, not an adopted dependency. Selecting the encoder and decoder remains part of L12-S02f.

UPC-A, Code 39, GS1-128, Data Matrix and PDF417 are not implied by the generic word "barcode". Add them only through a later explicit scope change. Digital decoding does not certify hardware scanning or physical printer calibration.

### Make existing print-specific work discoverable

`PageFrame`, `Row`, safe-area measurement, trim/bleed/crop marks, measured roll receipts, and label-sheet imposition already provide useful print-oriented capabilities. Document these from their actual code instead of creating cosmetic wrappers to inflate the component count. A `DocumentFrame`/flow-page composition is planned to make shared primitives useful beyond fixed business-card frames; exact public names must be settled in L12-S02a.

This comparison does not claim that those capabilities are impossible in PDFx: only that they are not separate entries in its inspected component inventory.

## Architecture requirements before gallery work

1. Separate theme access from fixed-frame geometry. Today `Text`, `Heading`, `Stack`, `Row`, `Separator`, and `FieldPair` require the private `PageFrame` context; the frame renders an absolutely positioned, non-wrapping content area. Do not put an A4 flow document into that area and assume it will paginate.
2. Introduce one shared PDF theme context usable by fixed and flowing pages. Keep fixed safe-area guarantees and existing template output intact. Define reserved header/footer space and oversized non-breaking blocks explicitly. Follow the engine's [pagination contracts](https://react-pdf.org/docs/v4/advanced).
3. Split source modules by responsibility, keeping the existing barrel as a compatibility facade. Extract common print geometry only if needed to avoid pulling the full render runtime into a simple primitive installation.
4. Use one implementation for aliases (`Divider`/`Separator`, `KeyValue`/`FieldPair`) and one table implementation for both composition and data convenience APIs. Do not maintain a second copy for docs or the registry.
5. Keep all PDF source independent of site DOM, Tailwind and shadcn UI. Site previews must come from actual generated PDFs. Trusted example JSX is compiled project source; never evaluate text submitted by a visitor.

## shadcn installation and theme continuity

Follow [ADR 0004](../adr/0004-source-distribution.md) and the [official registry workflow](https://ui.shadcn.com/docs/registry/getting-started). Add component-sized `docn-*` items with their true dependency closures and examples. Preserve `docn-primitives` for current consumers; installing one new primitive must not install unrelated templates, the whole catalog, or site code. Use the existing official CLI, relative internal imports, isolated `~/docn` targets and the consumer's unchanged `components.json`.

The current installation compatibility is not automatic theme compatibility. CSS custom properties, OKLCH and WOFF2/variable site fonts cannot simply be handed to the PDF renderer. Documentation must distinguish already-supported PDF-safe theme overrides from unimplemented conversion. A guide should show an explicit mapping from consumer theme roles to validated PDF tokens and qualified local fonts, with light-paper defaults even when the site is dark. No second initializer, no automatic rewrite of the consumer theme, and no claim that arbitrary site fonts work without registration and qualification.

## Definition of an available component

Each public index link must lead to a static detail page with:

- A concise purpose, typed props/defaults and actual limitations.
- At least one real PDF example from the shared example source, with enlarged inspection for small content.
- Runnable usage, the origin-aware official shadcn install command, and a bounded source view of that component and its direct supporting files.
- The shared code-block surface with highlighting, copy feedback and hidden visual scrollbars while preserving keyboard/trackpad scrolling.
- Working sidebar/search entries and stable route metadata. No inert names, dead links, unavailable-component badges or empty previews.

Retain the maintainer-approved shadcn documentation shell and responsive sidebars. Do not reintroduce template customization forms or redesign templates in this lot. The existing component index design should become genuinely navigable, not be replaced with an unrelated card dashboard.

## Verification and resumption

Preparation checks: the published and commit-pinned PDFx inventories were read; local primitive exports, template-local flow behavior, registry grouping, route files, L11 checks and issue #16 were inspected. No PDFx package was installed, no external source was copied, and no application behavior changed during this audit.

Implementation evidence belongs in `docs/qa/L12.md` as each story is verified. Use a shared PDF specimen for basic primitives, focused pagination/link/barcode/chart risks, and the existing external consumer orchestration for dependency/configuration isolation. Compare current template geometry/content after the context extraction without restyling their layouts. A component is not complete just because its name appears in the index.

L11 is still in review in [PR #31](https://github.com/Osiris-Balonga/docn-ui/pull/31), with seven successful checks at the inspected baseline. L12 remains planned until an authorized L11 merge is observed. Preparing this contract does not mark L12 started or verified.
