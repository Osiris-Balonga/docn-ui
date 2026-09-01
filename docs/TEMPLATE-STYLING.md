# Template styling policy

Templates follow the same source-ownership principle as shadcn/ui: the copied
template remains the source of truth for its visual identity.

- Every template declares its own base style with `defineTemplateStyle`.
- Base colors, font families and named visual slots belong to that template.
- Site colors and documentation themes must never leak into generated PDFs.
- Layout values remain in the template component and are not style overrides.
- A future theme builder may pass `TemplateStyleOverrides` for colors, fonts and
  named slots without changing the template's structure, spacing or geometry.
- Shared PDF primitives consume the resolved template theme through
  `PageFrame`; templates do not fork or restyle the primitives globally.

Brand assets are explicit component inputs. Shipped samples use only original
project-owned marks, generated fictional imagery, or locally documented assets
with redistribution rights. Third-party names, logos, product identities and
trademarks are never copied from visual references. Logo marks may be crisp
PDF-native vector compositions; photographs must remain validated local image
inputs rather than improvised drawings, letters or emoji.
