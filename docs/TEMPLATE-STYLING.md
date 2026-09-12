# Template styling policy

Templates follow the same source-ownership principle as shadcn/ui: the copied template remains the source of truth for its composition. L17 replaces the fragmented public `style` convention with one validated `theme` input shared by templates, the render facade and Theme Studio.

- Every template descriptor declares qualified default and supported theme IDs.
- The quick-render path accepts a preset `ThemeId`, a bare `PdfTheme` only when it is deeply equal to `themes[theme.id]`, or a validated `CustomPdfTheme` produced by the safe object overload `createPdfTheme({ baseThemeId, colors?, fonts? })`.
- The released `PdfTheme`, `getPdfTheme`, and `createPdfTheme(themeId, overrides)` advanced APIs remain source compatible. A modified bare `PdfTheme`, including one returned by `getPdfTheme(id, accent)`, is not a valid quick-render custom theme.
- A `CustomPdfTheme` is complete, records the preset it extends as `baseThemeId`, and requires `id === baseThemeId`. A template first checks that base against `supportedThemeIds`, then validates its declared compatibility envelope. The resolved theme is deep-cloned and deep-frozen before fingerprinting.
- `PdfTheme` owns reusable color roles, qualified body and heading fonts, the fixed qualified 400/700 weight pair, type scale and spacing scale. The initial cross-template envelope edits colors only. Font-family changes are available only when that template opts in to the specific manifest-qualified family after explicit overflow and page-count qualification; they are not globally geometry-safe. Theme Studio never changes weights, type scale, or spacing from the base preset.
- Template-specific decoration remains internal when it does not represent a reusable semantic role. A band color, illustration stroke or signature treatment must not become a public global token merely to preserve the old `slots` API.
- Layout, pagination, physical geometry, safe areas, print boxes and data are not theme values.
- Site colors, CSS variables, Tailwind classes, OKLCH values and documentation themes must never leak into generated PDFs.
- Templates consume the resolved theme through shared docn components and frames. They do not recreate public components locally when the public component satisfies the composition.
- The normalized resolved theme is complete and fingerprinted, but legacy adapters receive an optional differential `legacyStyle` projection. Omitted `theme` yields no projection and cannot change the source-owned composition or palette. For explicit input, the coordinator includes only color roles that differ from the descriptor's default resolved theme and differing body/heading families explicitly qualified for that template. Adapters preserve existing weights, type scale, spacing, page geometry and every other layout constant exactly.
- During the migration window, legacy `style` props may be preserved by explicit wrappers. New examples and definitions use only `theme`; wrappers must be documented as deprecated and removed only through a declared major-version change.

Qualified fonts remain local assets. Selecting a family in Theme Studio or code does not authorize a remote font request, arbitrary upload or silent system fallback. Theme Studio has no weight control. A new family or weight requires source, license, manifest, registration, glyph and PDF evidence before the schema can expose it; every template that opts in to another existing family also needs overflow and page-count evidence.

Brand assets are explicit component inputs. Shipped samples use only original
project-owned marks, generated fictional imagery, or locally documented assets
with redistribution rights. Third-party names, logos, product identities and
trademarks are never copied from visual references. Logo marks may be crisp
PDF-native vector compositions; photographs must remain validated local image
inputs rather than improvised drawings, letters or emoji.
