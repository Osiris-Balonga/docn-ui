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

Brand assets are explicit component inputs. A template must use an actual local
image asset for a logo or photograph instead of approximating it with a letter,
emoji or improvised drawing.
