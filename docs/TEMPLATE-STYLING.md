# Template styling policy

Templates follow the same source-ownership principle as shadcn/ui: the copied template remains the source of truth for its composition. L17 replaces the fragmented public `style` convention with one validated `theme` input shared by templates, the render facade and Theme Studio.

- Every template declares a qualified default `ThemeId` in its renderable definition.
- Public callers pass either a preset `ThemeId` or a complete `PdfTheme` produced by `createPdfTheme`.
- A custom `PdfTheme` records the preset it extends as `baseThemeId`. A template first checks `baseThemeId` against `supportedThemeIds`, then validates its declared compatibility envelope.
- `PdfTheme` owns reusable color roles, qualified body and heading fonts, the fixed qualified 400/700 weight pair, type scale and spacing scale. Theme Studio initially edits colors and the two font-family roles only; type scale and spacing remain equal to the base preset until a template declares and qualifies a wider geometry envelope.
- Template-specific decoration remains internal when it does not represent a reusable semantic role. A band color, illustration stroke or signature treatment must not become a public global token merely to preserve the old `slots` API.
- Layout, pagination, physical geometry, safe areas, print boxes and data are not theme values.
- Site colors, CSS variables, Tailwind classes, OKLCH values and documentation themes must never leak into generated PDFs.
- Templates consume the resolved theme through shared docn components and frames. They do not recreate public components locally when the public component satisfies the composition.
- During the migration window, legacy `style` props may be preserved by explicit wrappers. New examples and definitions use only `theme`; wrappers must be documented as deprecated and removed only through a declared major-version change.

Qualified fonts remain local assets. Selecting a family in Theme Studio or code does not authorize a remote font request, arbitrary upload or silent system fallback. Theme Studio has no weight control. A new family or weight requires source, license, manifest, registration, glyph and PDF evidence before the schema can expose it.

Brand assets are explicit component inputs. Shipped samples use only original
project-owned marks, generated fictional imagery, or locally documented assets
with redistribution rights. Third-party names, logos, product identities and
trademarks are never copied from visual references. Logo marks may be crisp
PDF-native vector compositions; photographs must remain validated local image
inputs rather than improvised drawings, letters or emoji.
