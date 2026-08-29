# L04 — PDF contracts, formats, themes, and primitives

Initial status: **planned**. Branch: `feat/document-foundations`.

Dependencies: L03. Requirements: FR-03, FR-07, FR-16; NFR-03, NFR-05.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/DOCUMENT_MODEL.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../TESTING.md).

## Scope and files

Formalize what the spike proved. Keep the core small; add monetary tables and imposition only with their families.

Target files/responsibilities: packages/documents/src/core, themes, primitives, catalog, render; asset manifest.

## Stories and commits in order

### L04-S01 — `feat(documents): define validated formats and render contracts`

- [x] Define request/result types, IDs/version, fixed/continuous formats, and mm/pt helpers; separate metadata from rendering functions.
- [x] Validate dimensions, orientation, allowed formats, and print profile; structured errors include field paths.
- [x] Define data normalization and shared limits without erasing invalid data.

**Acceptance:** Invalid/incompatible formats are rejected before reaching the engine; orientation applies exactly once.

**Targeted verification:** pnpm test:unit formats; reuse spike geometry tests instead of copying them.

### L04-S02 — `feat(documents): add local typography and portable theme tokens`

- [x] Create three PDF themes independent of web tokens, with engine-compatible colors and a bounded typographic scale.
- [x] Explicitly register required static weights; manifest provenance/licenses/hashes and French/English examples.
- [x] Create browser/Node AssetResolver with allowed IDs; never read URLs or paths from user data.

**Acceptance:** Changing the site theme does not change the PDF; document themes load only declared assets.

**Targeted verification:** Targeted theme/asset validation tests; extend L02's accented PDF fixture.

### L04-S03 — `feat(documents): add composable PDF layout primitives`

- [x] Implement only PageFrame, text/heading, Stack/Row, Separator, Image, and FieldPair used by the card.
- [x] Provide safe-area guards and fixed-frame overflow measurement using actual fonts; errors instead of unlimited shrinking.
- [x] Export explicit entry points; boundary tests prohibit site imports and DOM CSS in distribution.

**Acceptance:** Compose a page without Tailwind/shadcn/Next dependencies; text does not silently escape its frame.

**Targeted verification:** Targeted measurement/layout unit tests; one primitives PDF reusing the existing suite, not one test per prop.

### L04-S04 — `refactor(pdf): promote the rendering spike into shared adapters`

- [x] Replace temporary spike structures with final contracts; remove unused disposable code.
- [x] Retain useful feasibility fixtures and evidence; move viewer/protocol to architecture locations.
- [x] Document exports, permitted dependencies, and asset strategy for the future registry.

**Acceptance:** No competing second engine/reference fixture; build and initial qualification remain valid.

**Targeted verification:** pnpm validate; pnpm test:pdf feasibility; build if imports/worker changed.

## Exit criteria

Reusable, minimal foundations; all initial invariants preserved.

Update [status](../status.json) and create `docs/qa/L04.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No universal form factory, multibackend engine, or unused table/invoice abstractions.
