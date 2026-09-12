# Product — docn-ui

## Register

product

## Platform

web

## Users

React/TypeScript developers who need polished PDFs from data without redesigning every document. The catalog must also be understandable to a designer or someone trying a template, without turning V1 into a general-purpose editor.

## Product purpose

Extend the shadcn source-ownership workflow to printable documents and PDFs. Developers keep their existing shadcn project and `components.json`, add docn-ui as another registry, then own the installed document source. Users discover a template, inspect the exact PDF output, and obtain its source code without adopting a parallel design system or runtime service.

## Confirmed decisions

- A shadcn-compatible extension for print and PDF source: the official CLI, the consumer's existing `components.json`, composable components, source ownership, and a documented catalog.
- shadcn/ui for the site interface, with an experience reminiscent of its documentation.
- A variety of physical formats, including business cards and tickets.
- A first complete workflow using a business card, followed by other families.
- A detailed implementation plan in files, steps, and commits; no implementation during the original planning phase.
- English throughout the project, explicitly including documentation, plans, UI copy, and GitHub content (maintainer instruction, 2026-08-29).
- A reusable PDF component catalog covering PDFx's component categories, plus barcodes, with real examples, documentation and official shadcn installation (maintainer instruction, 2026-08-31). Further template redesign is paused while L12 delivers these capabilities; see the [component contract](docs/specs/COMPONENT_CATALOG.md).
- A post-V1 usability program that makes the qualified rendering guarantees available through one template contract, one `theme` input and matching Node/browser `renderPdf` calls, then migrates all eighteen shipped templates and builds Theme Studio on that same contract (maintainer instruction, 2026-09-12).

## Working assumptions in the plan

These are explicit agent proposals, changeable through an ADR before their lot; they are not attributed to the maintainer: document data support in French and English; a static Next.js site; local generation; distribution through the existing shadcn CLI; and the exact deprecation window for the pre-L17 template props. The English language of the site and project documentation is a confirmed requirement. License, public-release, merge and deployment decisions remain governed by the recorded external decisions and are never inferred from authorization to implement locally.

## Brand personality

Precise, restrained, accessible. The interface showcases the documents; templates may be more expressive than the interface. No promise of universal professional printing support.

## Anti-references

- A catalog of identical variants differing only in color.
- HTML previews that do not match the downloaded PDF.
- A tool requiring dozens of settings before the first document.
- An imitation of the shadcn or PDFx name, logo, or content.
- A promotional page that dominates the experience and delays access to templates.

## Design principles

1. The actual document is the source of truth for preview and download.
2. The physical format determines the composition; changing dimensions alone is insufficient.
3. Installed source belongs to the user's project.
4. The existing shadcn configuration remains authoritative; docn-ui does not create a competing project configuration.
5. Limits are visible: excessive text, incompatible formats, missing fonts.
6. Privacy is straightforward: trial data stays in the browser.
7. The first successful render requires document data and, optionally, a theme; format, local fonts, validation and print safety remain present but use qualified defaults.
8. Theme Studio exports the same validated theme syntax consumed by templates and renderers; it is not a second theming system.

## Post-V1 success condition

A consumer installs a template and the relevant source-owned render entry, calls `renderPdf(template, { data, theme?, format?, locale?, printProfile?, revision? }, runtimeOptions?)`, and receives the existing structured `RenderResult` without directly importing React PDF, registering fonts, resolving physical formats, or constructing a render plan. Advanced consumers may still use the lower-level primitives and plans. Simplicity is achieved by orchestration and defaults, not by removing strict data validation, local font manifests, the separate validated local-image channel, integer money calculations, physical-format checks, print-profile finalization or caller-owned revision ordering.

## Accessibility and inclusion

Design target: WCAG 2.2 AA for the site, full keyboard support, visible focus, 200% zoom, textual states, and respect for `prefers-reduced-motion`. PDF content is also available as accessible data in the editor; this does not certify PDF accessibility. Non-Latin scripts and their fonts require later qualification.
