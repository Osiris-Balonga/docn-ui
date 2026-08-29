# L03 — shadcn interface and navigation

Initial status: **planned**. Branch: `feat/shadcn-site-shell`.

Dependencies: L02. Requirements: NFR-02; foundation for FR-01, FR-02, FR-15.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../../DESIGN.md), [reference 2](../../TESTING.md).

## Scope and files

A credible, responsive documentation shell with docn-ui identity. Content pages arrive in their lots; never present nonfunctional buttons as available.

Target files/responsibilities: apps/www/src/app, components/ui, features/docs, styles, navigation.

## Stories and commits in order

### L03-S01 — `feat(ui): establish docn-ui tokens and accessible navigation`

- [x] Set the neutral palette, sizes, radii, focus, local fonts, and light/dark/system modes according to DESIGN.
- [x] Compose the header, sidebar, and mobile Sheet with shadcn primitives; add a skip link and semantic landmarks.
- [x] Add only ready routes; a concise homepage shows development status if the catalog is incomplete.

**Acceptance:** Keyboard navigation and theme switching work without content jumps or unreadable contrast between modes.

**Targeted verification:** Targeted responsive inspection and one navigation/focus composition test; no primitive unit tests.

### L03-S02 — `feat(docs): add searchable navigation and content layouts`

- [x] Create a lightweight known-page index, Command/Dialog palette, and Ctrl/Cmd+K shortcut.
- [x] Restore focus on close; handle no matches and avoid shortcuts interfering with application input.
- [x] Add reading/code layouts and breadcrumbs; install only used shadcn components.

**Acceptance:** Finding a known page, opening it, and closing search works with the keyboard; the index imports no PDF engine.

**Targeted verification:** pnpm test:components navigation; inspect the documentation route's bundle graph.

### L03-S03 — `test(ui): verify shell keyboard flow and responsive states`

- [x] Consolidate checks in the existing navigation suite; add axe checks for the shell and open Sheet if an uncovered risk justifies them.
- [x] Capture the four DESIGN viewports in representative light/dark states; manually check 200% zoom and reduced motion.
- [x] Record resolved defects and actual screenshots; do not create a snapshot for every component.

**Acceptance:** Usable shell at 375 px, no global overflow, visible focus, logical order.

**Targeted verification:** pnpm test:components navigation; targeted visual checks; pnpm validate.

## Exit criteria

The shell is ready for actual detail pages. Screenshots do not replace functional navigation.

Update [status](../status.json) and create `docs/qa/L03.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No fake fifteen-template grid, user accounts, or dashboards.
