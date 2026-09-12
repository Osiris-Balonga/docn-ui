# Design — site and documents

Status: target design specification. L01's minimal foundation page has been rendered and inspected; the catalog, navigation shell, and responsive qualification below remain planned from L03 onward. Explicit reference: the shadcn/ui documentation experience. See the [PRD](docs/PRD.md). All site copy and project documentation must be in English.

## Usage scenario

A developer browses the documentation on a work computer, compares PDFs, and copies code. A light interface makes comparison with a printed page easier; dark/system themes remain available without changing document themes.

## Site structure

| Route                                    | Content and primary action                                               |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `/`                                      | Concise promise, real previews, catalog and getting-started entry points |
| `/templates/`                            | Search, family/format filters, results, navigation                       |
| `/templates/[slug]/`                     | Data, actual PDF, compatible formats, themes, source, download           |
| `/components/` and `/components/[slug]/` | API, PDF example, source, limitations, installation                      |
| `/formats/`                              | Dimensions, compatibility, margins, printing guidance                    |
| `/themes/`                               | Three themes shown on the same document                                  |
| `/themes/studio/`                        | Configure a validated theme, preview it, and export a portable TS module |
| `/docs/[[...slug]]/`                     | Installation, guides, adding a template, limitations                     |

Slugs are known at build time; provide an explicit 404. No placeholder navigation pages: expose links only when their routes work.

## Composition

- Restrained header: docn-ui wordmark, Templates, Components, Docs, search, theme. Show a GitHub link only after actual configuration.
- Documentation sidebar on desktop; `Sheet` on mobile. Breadcrumbs and a table of contents only where useful.
- Reading width of 65–75 characters, with a wider catalog area. Template view uses two columns from 1024 px: 320–380 px settings and a flexible preview; below that, stack sections or tabs.
- Gallery thumbnails are rasterized from PDFs at their actual proportions. Do not force cards and receipts into the same A4 ratio; use neutral space around each format.
- Catalog specimens preserve each source-owned template's base colors, fonts and explicit local assets. Site colors never leak into PDF output. Theme Studio may supply a validated `PdfTheme` without changing template layout; see [Template styling policy](docs/TEMPLATE-STYLING.md).
- Shipped template samples never bundle third-party names, logos, product identities or trademarks; visual references are translated into original fictional identities and documented local assets.
- Selecting a specimen opens a larger generated-PDF overlay for close inspection without adding an editor to the catalog.
- Detail page: name, family, dimensions, page/side count, actions. `Preview` and `Code` tabs; a separate Data, Format, Theme, Print settings group.
- A template title does not include an applied theme: its intrinsic base style and any later user-selected override remain separate choices.
- Template code examples lead with `renderPdf(template, { data, theme })`, using the same flat options object accepted by every template. Low-level React PDF setup remains available in an advanced section, not in the primary example.

## Theme Studio

Theme Studio is a bounded theme configurator, not a layout editor. It starts from one qualified `baseThemeId`, edits the compatible roles defined by `PdfTheme`, previews the current resolved theme against real migrated templates, and exports a complete source file for the public `theme` option.

- The initial controls cover validated color roles and the qualified body and heading families. Weight, type-scale and spacing controls are not exposed: weights remain the qualified 400/700 pair, while type scale and spacing stay equal to the selected preset to protect template geometry.
- Custom-theme compatibility is checked first by `baseThemeId`, then by the selected template's theme envelope. The initial common envelope permits colors and qualified font-family changes only.
- The preview selector samples one fixed template, the existing `ComponentDocument`/`DocumentFrame` flow specimen, and one continuous template. The flow specimen is not presented as a migrated catalog template. The selector does not imply that every theme/format/template combination is supported.
- Invalid values remain editable but do not replace the last valid preview or enable code copying. Errors identify the exact theme path.
- Preset reset, copy feedback, keyboard order, visible focus, responsive stacking, 200% zoom and reduced motion follow the existing site rules.
- A synchronized textual preview lists the resolved theme roles, selected specimen, render state and `RenderResult` diagnostics. Render, validation, copy and contrast changes use restrained live regions; the PDF canvas is not the only source of information.
- Contrast checks report text/canvas, muted-text/canvas, text/surface and inverted-text/accent pairs. Failures block export for the initial supported envelope; passing diagnostics do not claim physical color proofing.
- Export downloads `~/docn/themes/<safe-name>.ts`, where `<safe-name>` is normalized to a bounded kebab-case identifier. The file imports `createPdfTheme` through a relative `./themes` import, compiles in the isolated consumer fixture and is never executed with `eval` or another runtime code evaluator.
- Shareable URLs may encode only bounded non-personal theme values if separately approved. They must never contain document data, image contents or local paths. Persistence beyond the existing site-theme preference is out of scope for L21.

## shadcn/ui

Install through the CLI, commit sources, and use semantic tokens. Choose Base UI once as the default. Install only components that are used.

Planned components: Button, Input, Textarea, Label/Field, Select, Tabs, Tooltip, Sheet, Separator, Breadcrumb, Command/Dialog, Alert, Skeleton, Badge, DropdownMenu, Switch, Table, and simple pagination if needed. Do not assume identical APIs across bases; consult documentation for the resolved version.

`components/ui` contains generated primitives. `features/catalog`, `features/playground`, and `features/docs` contain application compositions. Do not create ad hoc copies of an available button or dialog.

## Visual identity

- Site tokens in OKLCH, a neutral base, AA text contrast. Choose one restrained accent in L03; individual pages must not invent palettes.
- Geist Sans for the site and Geist Mono for code, with local files and tracked licenses. PDF fonts are separate in the document registry.
- Consistent shadcn radii, subtle separators, shadows reserved for floating surfaces; avoid nested cards.
- Lucide icons with accessible labels; action buttons have matching heights.
- Feedback animations of 150–200 ms; no entrance animation that hides content by default; respect reduced motion.
- No decorative grid, gradient text, pervasive glass effects, or imitation of the shadcn logo.

## Required states

| Area         | States to design                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Catalog      | Results, no results, cleared search, restored filters                                                                               |
| Editor       | Pristine, valid changes, invalid, reset                                                                                             |
| Rendering    | Initial, loading assets, generating, ready, stale, error, timeout; stale is determined from caller-owned revisions                  |
| Images       | Absent, imported, rejected, removed                                                                                                 |
| Code         | Selected file, copy success, clipboard unavailable                                                                                  |
| Export       | Available for the current revision, disabled, recoverable failure                                                                   |
| Theme Studio | Preset, edited, invalid, incompatible, rendering, last-valid preview, contrast diagnostics, reset, download/copy success or failure |

Keep the last valid PDF during input errors, mark it as outdated, and disable downloading until it matches current input. Announce errors near the field and through a restrained live region. Do not show a success toast before producing the file.

## Interactions

Search through `Ctrl/Cmd+K`, return focus to the trigger, and close with Escape. Use a logical editor tab order, PDF page navigation, zoom, and fit-to-width. Public filters may live in the URL; never place personal data, images, or document JSON in the URL or localStorage. Persist only the site theme preference.

The Code panel shows every required file and a typed usage example. Editing data never executes arbitrary code. Incompatible formats are hidden or disabled with a reason, never applied silently.

The catalog source drawer shows a bounded file tree: the template entry and example plus the direct family layout, schema, and plan. It does not expose `index` or metadata files, transitive primitives, or a general repository browser.

## Visual validation

Capture real screenshots at 375×812, 768×1024, 1280×800, and 1440×900, in light/dark modes and at 200% zoom. Specifically check very tall receipts, both sides of a card, no global horizontal scrolling, long code, keyboard search, and error states. Store evidence in the lot report. L01's desktop screenshot is a foundation smoke check, not this complete qualification.
