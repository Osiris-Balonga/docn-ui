# L12 — Documentation, components, formats, and themes

Initial status: **planned**. Branch: `feat/documentation-catalog`.

Dependencies: L11. Requirements: FR-02, FR-13, FR-15, FR-16.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../../DESIGN.md), [reference 2](../../specs/REGISTRY.md), [reference 3](../../specs/DOCUMENT_MODEL.md), [reference 4](../../TESTING.md).

## Scope and files

Make existing capabilities understandable and reusable. Component pages do not introduce new application components. Write all documentation in English.

Target files/responsibilities: apps/www/src/content/docs, features/docs, components/formats/themes routes, metadata, and search.

## Stories and commits in order

### L12-S01 — `feat(docs): document installation and independent PDF usage`

- [ ] Guides for installation, local assets, browser/Node, themes, formats, data/locale, and updating owned source.
- [ ] Import examples from verified consumer fixtures; avoid a second manually maintained example implementation.
- [ ] Limitation pages: fonts/scripts, printing, accessible PDFs, unsecured QR, uncertified invoices.
- [ ] Trusted local MDX only; never interpret user content as MDX.

**Acceptance:** A developer can follow prerequisites without monorepo knowledge and understand limitations before exporting.

**Targeted verification:** Documentation build and link checks; reuse consumer evidence instead of independently rerunning every snippet.

### L12-S02 — `feat(docs): expose PDF primitives formats and theme examples`

- [ ] Index/detail pages for actually available primitives with props, usage, PDF example, source/installation.
- [ ] Format pages with actual dimensions/compatibility; compare themes on the same document.
- [ ] Generate visuals through the existing pipeline; no test per paragraph or documentation card.

**Acceptance:** components/formats/themes routes are complete, indexable, and consistent with code contracts.

**Targeted verification:** Inventory/link checks and one documentation navigation smoke check; targeted visual review.

### L12-S03 — `docs(contributing): define template contribution and review workflow`

- [ ] Template contribution guide: schema/metadata/composition/fixture/registry/preview and a test in the appropriate scope.
- [ ] Visual/data quality checklist, licenses, format/API changes, and versioning.
- [ ] Include all documentation in search, titles/descriptions/canonical URLs, and sitemap; preview URLs must not be indexable.

**Acceptance:** Contributors can add a composition without changing playground core or copying an entire family.

**Targeted verification:** pnpm validate; pnpm build; static links. No full PDF suite for a documentation-only change.

## Exit criteria

Usable catalog, primitives, and guides; no misleading examples or incomplete source.

Update [status](../status.json) and create `docs/qa/L12.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No blog engine, CMS, fully multilingual documentation, or forum.
