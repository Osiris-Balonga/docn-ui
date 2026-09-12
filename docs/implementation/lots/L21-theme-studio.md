# L21 — Theme Studio

Initial status: **planned**. Proposed branch: `feat/theme-studio`.

Dependencies: L20. Requirements: FR-20, FR-23, NFR-01, NFR-02, NFR-12, NFR-14.

## Reading and entry criteria

Read the design specification, styling policy, ADR 0006, migrated template metadata and L20 evidence. Theme Studio must consume the implemented theme contract; it must not invent a second schema.

## Scope and files

Build a bounded static-site configurator for validated PDF theme roles with real local preview, synchronized textual output, contrast diagnostics and a portable TypeScript file export. It is not a document-data or layout editor. The initial cross-template geometry-safe scope edits colors only. A template exposes a body or heading family control only when its compatibility metadata opts in to that specific manifest-qualified family after overflow and page-count qualification.

Target responsibilities: `/themes/studio/`, theme form metadata, validation, preview coordination, code generation, accessibility and focused E2E.

## Stories and commits in order

### L21-S01 — `feat(theme-studio): derive controls from the PDF theme contract`

- [ ] Expose `baseThemeId` and supported color roles. Expose a body or heading family only for a selected template's explicitly qualified family opt-ins; do not present font switching as cross-template safe.
- [ ] Keep weights at the qualified 400/700 pair and keep type scale/spacing identical to the base preset.
- [ ] Keep an invalid draft separate from the last valid `PdfTheme` and provide path-specific messages.
- [ ] Validate the selected template's `baseThemeId` and theme envelope before preview.
- [ ] Provide deterministic reset without persisting document or theme drafts.

**Acceptance:** Every control maps to a real validated theme field; unsupported fonts and CSS/site tokens cannot enter the render input.

**Targeted verification:** Form reducer/schema units and keyboard-oriented component tests.

### L21-S02 — `feat(theme-studio): preview themes with migrated templates`

- [ ] Preview through browser `renderPdf`, not a CSS or HTML approximation.
- [ ] Offer one fixed template, the existing `ComponentDocument`/`DocumentFrame` flow specimen and one continuous template while respecting compatibility. Do not label the flow specimen as a catalog template.
- [ ] Preserve last valid bytes during invalid/rendering states and release object URLs/tasks.
- [ ] Provide a synchronized textual alternative listing resolved roles, specimen, render state and actual `RenderResult` diagnostics.
- [ ] Announce validation, render and revision-state changes through restrained live regions; stale is determined by the UI from caller-owned revisions.

**Acceptance:** The visible preview and downloadable sample use the same accepted result revision.

**Targeted verification:** Focused browser integration with one sample per plan kind; no full catalog/theme matrix.

### L21-S03 — `feat(theme-studio): export a portable theme source file`

- [ ] Normalize a bounded user name to kebab case and download `~/docn/themes/<safe-name>.ts`.
- [ ] Generate a stable `createPdfTheme({ baseThemeId, colors?, fonts? })` module with a relative import from `~/docn/themes/<safe-name>.ts` to the installed local themes module, accepted unchanged by `renderPdf`.
- [ ] Omit values equal to the selected base without changing the resolved theme.
- [ ] Compile the exported module in the isolated consumer fixture; never execute generated or user-authored source through `eval`, dynamic `Function` or runtime module loading.
- [ ] Handle download/copy success and failure accessibly.

**Acceptance:** A normal TypeScript import of the generated file resolves to the same theme and fingerprint as the preview.

**Targeted verification:** Safe-name/path units, TypeScript consumer compilation, imported theme round trip and focused download/clipboard UI tests.

### L21-S04 — `test(theme-studio): qualify responsive accessible local behavior`

- [ ] Verify 375, 768 and desktop layouts, 200% zoom, keyboard order, focus, contrast and reduced motion.
- [ ] Intercept network activity to prove document/theme data and fonts remain local to the consumer origin.
- [ ] Report text/canvas, muted-text/canvas, text/surface and inverted-text/accent contrast diagnostics; block export on initial-envelope failures without claiming print color proofing.
- [ ] Verify the textual alternative and live regions without relying on the PDF canvas.
- [ ] Update discoverability from `/themes/` without turning the catalog into a promotional gate.

**Acceptance:** Theme Studio is usable and honest about qualified choices, with no remote rendering or personal-data persistence.

**Targeted verification:** Axe/component checks and one focused Chromium journey with selected screenshots.

## Exit criteria

Theme Studio previews and exports the real unified theme syntax and meets existing site accessibility/privacy boundaries.

Update status and `docs/qa/L21.md`. Public deployment, analytics expansion and share links require their own authorization or decision.

## Out of scope

No layout editor, document data form, font-weight/type-scale/spacing editor, arbitrary font upload, remote asset URL, account, saved theme cloud, public gallery or executable user code.
