# PDF component catalog — PDFx comparison and L12 contract

Date: 2026-08-31. Status: **L12 in progress**, not a public component availability claim. S01 and S02a–S02g are locally verified; component detail pages and the gallery remain S02h work. The maintainer requested component availability and documentation before further template redesign. L12 must cover the component categories below and add barcodes. Existing template compositions remain unchanged during this work, except for necessary, behavior-preserving imports.

## Evidence and scope

The reference is [PDFx by akii09](https://github.com/akii09/pdfx), not the unrelated PDFX products or the PDF/X print standard. Its [published registry](https://pdfx.akashpise.dev/r/index.json) and [source registry at commit 4b5c8df](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/registry/index.json) both list 24 component entries on the inspection date. Neither lists Barcode. This observation is limited to those inventories; it is not a claim that PDFx cannot be extended to render one.

The comparison also inspected PDFx's public prop references for [Heading](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/heading.constant.ts), [Text](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/text.constant.ts), [Form](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/form.constant.ts), [Graph](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/graph.constant.ts), [List](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/list.constant.ts), [Signature](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/signature.constant.ts), and [QRCode](https://github.com/akii09/pdfx/blob/4b5c8dfb4b65ad63481a59300b31c3ee97181b4f/apps/www/src/constants/qrcode.constant.ts). Inventory coverage is not API or visual parity: each component needs its own typed contract and examples before it is advertised.

Local baseline: `a9a5dc582575c90c216817c78570c65892b5eb8f` on `feat/invoice-templates`. [Primitive sources](../../packages/documents/src/primitives/index.tsx) expose nine JSX components and three [flow-table helpers](../../packages/documents/src/primitives/table.tsx). The [site index](<../../apps/www/src/app/(site)/components/page.tsx>) lists nine names as non-interactive text; no component detail routes exist. The [registry manifest](../../tooling/registry/source-manifest.mjs) installs primitives as one `docn-primitives` item. Thus, source existence does not yet mean that a developer can discover and install an individual component from its documentation.

## Coverage matrix

"Existing" below means a related implementation exists, not that all PDFx options are supported. No item in this matrix is a completed L12 deliverable yet.

| PDFx component | docn-ui baseline                          | Required L12 outcome                                                                                                           |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Alert          | Missing                                   | Titled callout, explicit status text, optional supporting content; neutral default.                                            |
| Badge          | Missing                                   | Compact status label, size and tone options; no reliance on color alone.                                                       |
| Card           | Missing                                   | Composable content container with optional heading and controlled padding.                                                     |
| DataTable      | Missing                                   | Typed columns and rows built on the same table primitives, not a second layout engine.                                         |
| Divider        | Existing `Separator`                      | Document horizontal separation; retain `Separator` and expose a discoverable `Divider` alias without duplicate implementation. |
| Form           | Missing                                   | Printable labeled fields and grouped one/two/three-column layouts; blank or populated values. Not interactive AcroForms.       |
| Graph          | Missing                                   | Bar, horizontal bar, line, area, pie, and donut; PDF-native vector output, labels and legends.                                 |
| Heading        | Existing, two named sizes                 | Level hierarchy, alignment and safe style controls; keep existing `display`/`heading` usages working.                          |
| KeepTogether   | Only inline `wrap={false}` usage          | Explicit bounded grouping for flowing pages, with documented oversized-content behavior.                                       |
| KeyValue       | Existing vertical `FieldPair`             | Horizontal/vertical label-value layout; keep `FieldPair` compatible and share implementation.                                  |
| Link           | Missing                                   | PDF link annotations and readable text; validated HTTP(S), mailto, tel, or explicit internal destinations.                     |
| List           | Missing                                   | Bullets, numbering, nesting, descriptive entries and static check states; bounded depth and length.                            |
| PageBreak      | Engine behavior only                      | Explicit page break for flowing content, documented separately from a fixed-format frame.                                      |
| PageFooter     | Invoice-specific inline layout            | Reusable inline/repeated footer with reserved space, optional contact information and page numbering.                          |
| PageHeader     | Invoice-specific inline layout            | Reusable inline/repeated header with optional resolved logo and reserved space.                                                |
| PageNumber     | Invoice-specific render callback          | Current/total page numbering resolved after pagination, with configurable text.                                                |
| Image          | Existing resolved-source image            | Controlled fit, size, caption and alignment using permitted local assets; no arbitrary user URL fetch.                         |
| QRCode         | Existing vector QR and density validation | Document and expose the existing implementation; retain the four-module quiet zone and final-PDF decoding checks.              |
| Section        | Missing                                   | Logical content group with heading and spacing; no universal layout component with dozens of flags.                            |
| Signature      | Missing                                   | One/two signer areas and inline signature field; optional name/date/role. Not a digital signature.                             |
| Stack          | Existing vertical stack; separate `Row`   | Document vertical/horizontal composition and token-based spacing, preserving both existing APIs.                               |
| Table          | Partial `FlowTableHeader/Row/Cell`        | Composable table surface, headers/cells, alignment and predictable pagination; preserve existing invoice helpers.              |
| Text           | Existing string-only text                 | Paragraph and inline typography, alignment and available font weights; explicit font/style limits.                             |
| Watermark      | Missing                                   | Restrained text overlay with opacity, placement and repeat behavior; not document protection.                                  |

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
- Record library version, license, transitive notices and measured bundle cost before adding a dependency. [bwip-js](https://bwip-js.metafloor.com/) was the initial cross-platform vector/custom-drawing candidate; the S02f decision below selects a different encoder after qualification.

### S02f Barcode API decision

Adopt JsBarcode 3.12.3 object output and test-only ZXing 0.23.0 after the [dependency review](../DEPENDENCIES.md#vector-barcodes-l12-s02f). `Barcode` uses a dedicated module/registry item, never the legacy primitive barrel. It reads the existing PDF theme context; that context becomes a small shared registry item ahead of S02g without changing its runtime source.

`format` is exactly `code128` or `ean13`. `value` is a string: Code 128 accepts 1–80 printable ASCII characters, preserves spaces, rejects control/FNC/Unicode characters, and delegates automatic B/C selection and the mandatory symbol checksum to the encoder. EAN-13 accepts exactly 13 ASCII digits including a valid supplied check digit; no silent repair or 12-digit expansion. `ean13CheckDigit` explicitly computes the final digit from exactly 12 digits. No GS1-128, application identifiers, add-ons or other formats.

`width` in points includes mandatory quiet zones (Code 128: 10 modules on each side; EAN-13: 11 left / 7 right). Defaults are 240 pt and 120 pt respectively. The module width must be 0.25–1.016 mm for Code 128, 0.264–0.66 mm for EAN-13. `barHeight` in points defaults to a conservative floor: at least 15 mm and 15% of the encoded bar width for Code 128; EAN-13 scales 22.85 mm at a 0.33 mm module. Requests below the floor, above 144 pt, beyond 720 pt width, or with invalid dimensions fail explicitly. No silent shrinking. EAN guard bars extend by five modules; four points of white vertical padding surround the symbol. `showValue` defaults true and adds a separate selectable line below the pattern, using the PDF body font/caption size; unreadable or overflowing text fails. Bars, spaces and quiet zones remain opaque black/white regardless of theme. The non-breaking box must fit the author's containing frame.

These are deliberately bounded product rules, not a barcode verification grade, GS1 registration or physical scanner/printer certification. EAN text is a separate complete payload line, not a retail-certified glyph placement. Quiet-zone references: [GS1 size guide](https://gs1.se/en/guides/how-to-guides/size-guide/), [IDAutomation Code 128](https://www.barcodefaq.com/1d/code-128/). Actual final PDF raster decoding is mandatory for both formats, including a minimum-module case and leading-zero EAN. One shared specimen and the existing two-environment consumer orchestration cover the boundary; no format/theme/printer matrix.

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

## S02a frame API decision

`PdfThemeProvider` and `usePdfTheme` supply explicit, already validated PDF tokens independently of geometry. A missing provider is an error. `PageFrame` keeps its required theme prop, safe area, absolute content placement and print-profile behavior; existing imports remain valid through `primitives/index.tsx`.

`DocumentFrame` renders a wrapping engine Page directly under the engine Document, not a second Document or an absolutely positioned body. Its initial contract supports resolved portrait A4/Letter trim-sized pages (screen profile), a required theme, an optional uniform margin in points, and optional header/footer regions `{ content, height, gap? }` in points. The default margin is the format safe inset; smaller margins, non-finite/negative dimensions and reservations leaving no body area fail explicitly. Each region is repeated at its reserved absolute position; page padding reserves its height plus gap on every physical page. Body children remain in normal flow. Printed bleed/crop marks continue to use PageFrame or existing family layouts; they are not silently added to DocumentFrame.

`createFlowFrame` exposes body/header/footer bounds for measurement. Region content is trusted, premeasured JSX and must fit its declared height; the frame does not guess text height or silently clip overflow. `assertFlowBlockFits` checks a measured, finite positive non-breaking block height against the complete available body height, including reserved space. A fitting block may move to the next page; an oversized block must be split by its component's explicit policy or rejected as LAYOUT_OVERFLOW, never shrunk or clipped. S02c will compose this contract into KeepTogether/table components and qualify their actual layout.

Primitive modules split by responsibility without duplicating JSX. Pure page-box arithmetic moves to `core/page-geometry.ts`; `render/print-profile.ts` retains its existing export and post-processing API. This keeps geometry independent from PDF post-processing and prepares component-sized dependency closures. S02a updates the existing aggregate registry item to include its extracted files, but does not yet advertise individually installable components.

## S02b content API decision

These are source-owned PDF APIs, not drop-in PDFx props. Existing calls and default template geometry remain unchanged. All styling comes from the explicit PDF theme, not browser styles; only the qualified regular/strong font weights are exposed.

- `Text` accepts strings, numbers and trusted inline Text/Link composition, token sizes, `align`, `weight`, `tone` and an optional destination `id`. `Heading` retains `display`/`heading` and adds levels 1–6, mapped to display/heading/label/body/caption/caption tokens, plus alignment and destination IDs. Levels describe visual hierarchy, not a PDF/UA tagging guarantee. Neither component truncates text or accepts unregistered fonts/italic styles.
- `Stack` adds horizontal/vertical direction, cross-axis alignment and main-axis justification. `Row` shares that implementation with its existing horizontal/start/small-gap defaults. `Divider` is exactly `Separator`; `KeyValue` is exactly `FieldPair`, with vertical (legacy default) or horizontal orientation. Horizontal values flex and wrap instead of imposing an arbitrary fixed label width.
- `Section` groups children with an optional title and token gap. `Card` adds token padding and a neutral themed surface/border. These are flow containers, not fixed-height clipping boxes or automatic keep-together blocks.
- `Link` emits the engine's native annotation. Its required readable string label and `href` are bounded to 2,000 characters. Only explicit HTTP(S), single-address mailto, plain international/local tel and `#destination` references are accepted. Control characters, credentials, protocol-relative URLs and executable/file/data schemes are rejected. Destinations use `[A-Za-z][A-Za-z0-9_.:-]{0,127}`; authors must define unique, existing IDs. External navigation is never performed during generation.
- `Image` retains `alt`, `width`, `height`, `resolvedSource`; adds `fit` (contain/cover), start/center/end alignment and optional caption. Dimensions must be finite positive points. Sources must be prevalidated local PNG/JPEG base64 data URLs (at most 5 MiB decoded) or caller-owned blob URLs, never remote/file paths. The existing import boundary remains responsible for decoding, the 16-megapixel limit and blob revocation. The primitive cannot infer byte/pixel limits from an opaque blob URL. Caption/alignment use a natural-height wrapper; the legacy image-only call does not add a wrapper.
- `List` accepts immutable `{ text, description?, checked?, children? }` items and a bullet/numbered/check marker. It permits at most 100 items in total, depth 3 and 2,000 characters per text field; malformed/cyclic/oversized input fails explicitly. Numbering restarts at each nested group. Check marks are static vector graphics, not interactive form controls. Flow remains breakable; advanced pagination is S02c.
- `QRCode` keeps its existing vector renderer, payload limit, minimum module size and four-module quiet zone. This story does not add another encoder or alter scanner qualification.

The combined typed example is compiled project source, not visitor-supplied JSX. It qualifies actual selectable text, external/internal link annotations, a local image, nested lists and QR composition in one PDF. Component-sized registry entries and public gallery routes remain S02g/S02h work.

## S02c pagination and table API decision

`KeepTogether` is a normal-flow, non-breaking group with a required `measuredHeight` in points. It reserves that minimum height and rejects a non-finite, non-positive or larger-than-body value with LAYOUT_OVERFLOW. Children are trusted, premeasured composition: their actual height must not exceed the supplied reservation. The component does not measure arbitrary JSX, clip it, shrink its font or split it silently. `PageBreak` requires following children and starts that content on a new flowing page; do not put it inside KeepTogether or use it as an empty trailing marker. Both require DocumentFrame's flow context.

`PageHeader` and `PageFooter` are inline content compositions. Put them into DocumentFrame's existing `{ content, height, gap }` regions to repeat them with reserved space; use them in body flow for one-time content. Header accepts an optional locally resolved Image; footer accepts contact/other children and optional PageNumber props. Region heights remain explicitly declared and must cover their children. `PageNumber` uses the engine's final-pagination callback with a bounded format string containing `{page}` and optionally `{pages}` (default `Page {page} of {pages}`); numbering covers the whole Document, not a reset per frame.

`Table`, `TableRow`, `TableCell` and `TableHeader` compose through the existing FlowTable helpers. Public columns have unique keys, readable labels, left/right alignment and numeric percentage widths totaling 100; one to twelve columns are allowed. TableRow requires a measured height and exactly one direct TableCell per column, in column order. Cells accept bounded strings or finite numbers, not arbitrary unmeasured nested JSX. Natural text wrapping remains enabled. The reservation includes vertical cell padding and borders; rows must be measured at the actual table width/font, and every non-breaking row must fit the complete flow body. Oversized declarations are rejected, never split or truncated.

`TableHeader` accepts the same column constant and a measured height. Place it in a reserved PageHeader region for repetition, or in flow for a one-time heading. It is not an independently fixed overlay: the parent frame owns repetition and spacing, so table columns cannot silently overwrite a document title. Separate frames define distinct repeated table headings when a document contains different tables. Header labels must fit the declared height. The initial table surface spans the full flow-body width; do not nest it inside a narrower column without a separately measured frame.

`DataTable<T>` maps typed data with `cell(row)`, `rowKey(row, index)` and `rowHeight(row, index)` callbacks to those same Table/Row/Cell components. It accepts at most 500 rows, 12 columns and 2,000 characters per cell, rejects duplicate/empty keys, invalid values and oversized row declarations, and supports an explicit empty-message prop. Callbacks are trusted compiled source, not user-entered code. Row heights are required rather than guessed from character count. This is deliberately not a universal automatic text-measurement engine; native wrapping and the documented premeasurement boundary remain visible.

The shared multipage specimen will qualify repeated headers/footers, final numbering, first/last rows exactly once, wrapped cells, a summary that moves intact and an explicit break into a compositional table. Existing invoice helper calls and nominal layouts must remain unchanged.

## S02d printable form and annotation API decision

`Alert` accepts a required title, optional supporting text and a visible status label (`Note` by default). `Badge` accepts a required short label, compact/regular sizing and neutral/outline tone. Both use the PDF theme's monochrome roles, never an implicit status color or site icon. Text stays selectable and wraps naturally. These inline compositions work in either frame; callers remain responsible for fitting trusted content into fixed pages.

`Form` accepts one to twelve titled groups, each with one to three equal-width columns and bounded fields (`id`, `label`, optional `value` and `required`). At most 60 fields are allowed; identifiers are unique across groups. Missing/empty values leave a writing line. Required fields print `(required)` beside the label. Rows are non-breaking, groups may continue between rows, and the group title stays with its first row. There are no HTML inputs, submission handlers, hidden data fields or interactive AcroForms. Values are bounded strings, not evaluated JSX. Text wraps without clipping; authors must qualify row heights at the actual width and theme before placing unusually long content or large fonts on a page.

`Signature` accepts one or two signers with a required label and optional name, role and date. Stacked areas reserve a configurable 24–96 pt writing space (default 40 pt) above the signature line. Inline mode supports exactly one signer. Names are printed text, not reproduced handwriting; no cryptographic signature, identity verification or legal validity is implied. The signer group is non-breaking and must fit its containing frame.

`Watermark` is a direct child of DocumentFrame, not a nested flow block. It uses the reserved body rectangle, never the header/footer. Its text is placed at the top, center (default) or bottom of that rectangle, with opacity 0.02–0.2 (default 0.08), font size 12–96 pt (default 32), rotation from -60 to 60 degrees (default 0), and repeat enabled by default. With repeat disabled it appears only on the first page of that frame, regardless of preceding frames. A conservative width/height envelope rejects labels that cannot fit without shrinking or clipping and uses the body diagonal only when validating a rotated label. The surface accepts 1–24 printable Latin characters; image marks, arbitrary Unicode shaping and fixed-format PageFrame placement are not qualified. Place it after body content for a visible overlay. Watermarks are annotations of intent, not document protection; printed contrast still requires review.

The existing shared content specimen will gain printable forms/annotations and a second page to verify repeated versus first-page-only watermarks. No new dependency, template restyling or site shell change is required. The aggregate registry remains compatible; individually installable items and public examples arrive in S02g/S02h.

## S02e vector graph API decision

`Graph` accepts `type` (`bar`, `horizontal-bar`, `line`, `area`, `pie`, `donut`), a required title and series label, immutable `{ label, value }` data, and explicit physical width/height (defaults 250 × 215 pt). This is a single categorical series, not a time/logarithmic/scatter or stacked/multi-series engine. Input order is preserved; labels are unique. Cartesian charts allow at most twelve entries, circular charts eight. Values must be finite, at most 1 billion in magnitude, and either zero or at least 0.000001 in magnitude. Calculations use input precision; printed numeric values use six significant digits and circular shares one decimal place. Financial precision/compliance is not implied.

Empty arrays produce a visible `No data` message, not an invented zero-valued chart. Cartesian scales always include zero, use linear 1/2/5-based ticks and expand all-zero data to 0–1. Negative values are supported in all four Cartesian forms; area fills close to the zero baseline. Pie/donut reject negative values, retain zero entries in the legend without drawing a sector, and show `No positive values` for an all-zero total. A single positive category produces a complete circle/ring. No row is silently dropped, reordered or aggregated.

All geometry is native PDF SVG, with selectable labels, theme fonts and grayscale defaults derived from existing PDF theme roles. Titles, numeric ticks and category labels remain visible. Cartesian grid lines, numeric values and legends may be hidden explicitly; visible legends accept line, circle or square markers. Bars accept a bounded corner radius and charts accept an explicit per-datum color sequence. Circular leader labels and numbered category/value/share legends may also be hidden when the surrounding composition provides an equivalent readable explanation. There are no hover-only values, screenshots, remote renderers or site chart dependencies.

Width/height are bounded to 160–540 / 160–700 pt; callers must choose a box that fits their containing frame. Each graph is non-breaking. Internal plot, tick, title and legend reservations are computed from the actual theme font sizes. A conservative printable-Latin text envelope rejects insufficient text space with LAYOUT_OVERFLOW rather than truncating labels, hiding ticks, shrinking fonts or rotating text. Labels are 1–32 characters, titles 1–64; control characters, soft hyphens, multiline labels and unqualified text shaping are rejected. Dense data should use a wider chart, shorter explicit labels or a separate table. Positive circular sectors need at least 2 pt of outer arc length; smaller shares fail explicitly instead of vanishing beneath their separating stroke. Aggregate them explicitly or choose a Cartesian representation. This is a declared print-density contract, not arbitrary font measurement.

One two-page graph specimen will cover all six nominal forms together and the distinct empty/zero/negative/single-sector risks. Tests will check scales/geometry and actual PDF vectors/text, followed by raster inspection. No new dependency or template/site restyling is required. Source remains in the aggregate registry until component-sized entries are exposed in S02g.

## shadcn installation and theme continuity

### S02g distribution decision

Split grouped JSX modules into component-sized sources while preserving the existing `typography`, `layout`, `containers`, `annotations`, `pagination`, `page-regions` and `index` facades. Aliases such as Divider/Separator and KeyValue/FieldPair remain the same implementation. Registry sources retain one owner and stable `~/docn` targets; legacy aggregate items depend on the new owners. Narrow core contracts and font/asset preparation into explicit supporting items so a basic component never depends on the full rendering pipeline, templates, graph, QR or barcode code.

Each component item declares its primary source and a bounded list of supporting sources for the code view. Validate that list against its installation closure during generation; never traverse the entire registry for preview. Shared tables/graph helpers may be shown when needed to understand the selected component. Template previews keep their existing template/family boundary. Full installation still resolves all required source through the official CLI.

Two compiled, installable examples qualify distinct graphs: a minimal Text document and a flow document combining DataTable, Graph and Barcode. Basic components do not install examples or font assets implicitly; those are explicit opt-in items for a runnable document. Existing shared specimens cover the remaining APIs and will feed the per-component pages in S02h. Reuse the existing two-environment consumer test, assert the light closure before adding the legacy template, render after stopping the registry, and preserve consumer configuration/CSS/owned files without overwrite flags. No dependency or UI redesign is required.

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

The initial comparison preceded L11's authorized merge. [PR #31](https://github.com/Osiris-Balonga/docn-ui/pull/31) is now merged at `a342433e0902935a454d8ef04a85cb508a765f4a`; L12 implementation is in progress. Story results are recorded in the [L12 QA report](../qa/L12.md). Neither the comparison nor the shared-frame foundation completes the public component catalog.
