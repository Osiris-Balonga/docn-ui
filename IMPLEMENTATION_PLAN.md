# docn-ui — implementation and delivery plan

Date: 2026-08-28. Status: **L00G through L05 are merged; L06 is in progress on `feat/catalog-and-playground`**. The plan contains **18 lots and 60 planned stories/commits**, excluding documentation commits for traceability. The [lot status](docs/implementation/status.json) records actual progress. Language revision: 2026-08-29; all project content must be in English, while conversation with the maintainer is in French.

## 1. Execution contract

Read [AGENTS.md](AGENTS.md). The PRD describes the expected result; specifications define contracts; lots sequence the work. If these conflict, stop the affected work, explain the discrepancy, and correct the documents before coding. Assumptions remain identified in [PRODUCT.md](PRODUCT.md).

The directory was empty and had no `.git` when planning began. No commit, remote, domain, hosting, or publication rights were assumed to exist.

## 2. Adapted inspiration

The initial `paint-3d` plan at commit `c2cbdd5` provides the model: governance, architecture, lots, atomic commits, tests, and delivery criteria. Here, lot specifications are separate to simplify resumption. Differences are detailed in [REFERENCES.md](docs/REFERENCES.md); no changes are authorized in the reference project.

BMAD-inspired organization without a BMAD runtime: brief → PRD → architecture/ADRs → epics/lots → stories/commits → evidence and status. A lot corresponds to a deliverable epic; each planned commit carries a story ID `Lxx-Syy`.

Revision requested on 2026-08-28: adapt Munganga's GitHub governance, tighten PR direction rules, and preserve commits. L00G is inserted without renumbering existing IDs; its stories use `L00G-Syy`.

## 3. Reading and sources of truth

| Question | Canonical document |
| --- | --- |
| What should be delivered? | [PRD](docs/PRD.md) |
| What should the site look like? | [DESIGN](DESIGN.md) |
| Where should it be implemented? | [Architecture](docs/ARCHITECTURE.md) |
| What PDF behavior is required? | [Contracts](docs/specs/DOCUMENT_MODEL.md) |
| Which templates? | [Catalog](docs/specs/TEMPLATE_CATALOG.md) |
| How is source code obtained? | [Registry](docs/specs/REGISTRY.md) |
| What evidence is required? | [Testing](docs/TESTING.md) |
| What is the actual status? | [status.json](docs/implementation/status.json) and QA reports |
| Which commits come next? | The lot specification below |
| Which GitHub rules and tracking apply? | [GITHUB](docs/GITHUB.md) and [actual IDs](docs/implementation/github.json) |

## 4. Lot sequence

Execution is sequential by default. `Depends on` identifies the preceding lot required to begin; its own prerequisites are transitive. Lot specifications and `status.json` use the same sequence. Do not add parallel agents or branches without a maintainer request.

| Lot | Deliverable | Depends on | Specification |
| --- | --- | --- | --- |
| L00 | Governance and first documentation commit | — | [Governance](docs/implementation/lots/L00-governance.md) |
| L00G | Public repository, protections, Project, and issues | L00 | [GitHub](docs/implementation/lots/L00G-github-governance.md) |
| L01 | Workspace, Next.js, shadcn, tests, and minimal CI | L00G | [Bootstrap](docs/implementation/lots/L01-bootstrap.md) |
| L02 | PDF feasibility proven in the actual build | L01 | [PDF rendering](docs/implementation/lots/L02-pdf-feasibility.md) |
| L03 | shadcn site shell and navigation | L02 | [Interface](docs/implementation/lots/L03-site-shell.md) |
| L04 | PDF contracts, formats, themes, and primitives | L03 | [Foundations](docs/implementation/lots/L04-document-foundations.md) |
| L05 | First complete business card, then three compositions | L04 | [Business cards](docs/implementation/lots/L05-business-cards.md) |
| L06 | Catalog and reusable data editor | L05 | [Catalog](docs/implementation/lots/L06-catalog-playground.md) |
| L07 | Real source installation outside the monorepo | L06 | [Registry](docs/implementation/lots/L07-registry.md) |
| L08 | Three event tickets | L07 | [Tickets](docs/implementation/lots/L08-event-tickets.md) |
| L09 | Three thermal receipts | L08 | [Receipts](docs/implementation/lots/L09-thermal-receipts.md) |
| L10 | Three labels and label sheets | L09 | [Labels](docs/implementation/lots/L10-labels.md) |
| L11 | Three multipage invoices | L10 | [Invoices](docs/implementation/lots/L11-invoices.md) |
| L12 | Documentation, component gallery, and guides | L11 | [Documentation](docs/implementation/lots/L12-documentation.md) |
| L13 | Accessibility, security, and performance | L12 | [Hardening](docs/implementation/lots/L13-hardening.md) |
| L14 | Full qualification and installations | L13 | [Qualification](docs/implementation/lots/L14-qualification.md) |
| L15 | Final CI, preview, and delivery preparation | L14 | [Delivery](docs/implementation/lots/L15-delivery.md) |
| L16 | Final QA, authorized publication, and v1.0.0 | L15 | [Release](docs/implementation/lots/L16-release.md) |

## 5. Decision gates

- **G0 / L00 + L00G**: first local commit, then a verified protected public repository, Project, and issues; integrate L00G before application bootstrap.
- **G1 / L02**: exact card dimensions, local fonts, both sides, a long receipt, and worker rendering proven. Address engine difficulties here, not after fifteen templates.
- **G2 / L05**: first useful workflow, data → actual preview → download, visually validated.
- **G3 / L07**: source installed in a fresh project without dependence on the monorepo or docn-ui site.
- **G4 / L11**: fifteen real compositions across five families, with fixtures and registry entries.
- **G5 / L14**: requirements and risks covered by targeted sampling, with documented limits and exceptions; no combinatorial matrix.
- **G6 / L16**: authorized publication, immutable version and assets, and public-site verification. A local build does not satisfy this gate.

## 6. Git and commits

Model: `main` = public version; `dev` = integration and default branch; lot branches target `dev`. Both branches require PRs; only `dev` from the same repository may target `main`. Merge commits only. The one-time L00G remote bootstrap is documented in [GITHUB](docs/GITHUB.md); after that, no direct pushes, bypasses, squash merges, or automatic merging.

Exact commit messages and contents are in the lot specifications. Behavior tests belong in the same commit as the code; additional `test(...)` commits cover cross-cutting journeys. A story may be split if it becomes too large, with suffixed IDs and a reason recorded in its specification before execution.

Offline mode: subsequent lots may start from the last `verified_local` lot if the user asks to continue locally. Future PRs initially stack onto the preceding branch; once it is merged, retarget the next PR to `dev`. No false `merged` status and no rewriting commits to fabricate history.

## 7. Status and resumption

States: `planned` → `in_progress` → `verified_local` → `in_review` → `merged`; `released` is reserved for L16. `blocked` includes a concrete reason and resumption condition. No invented dates, results, or SHAs.

L00 is now `verified_local`, with its two existing commits; other lots reflect actual progress. Each entry links to its specification; expected commits stay there. `actualCommits` contains only existing SHAs. The Project provides shared tracking: one issue per lot, story checklists, evidence, and linked PRs. [GITHUB](docs/GITHUB.md) defines transitions without equating local verification with merging.

## 8. Authorizations and external decisions

The maintainer requires GitHub before L01 and confirms a public `Osiris-Balonga/docn-ui` repository. L00G setup is authorized; merging is a separate decision. License, host, domain, and site publication are undecided. Unavailable GitHub access blocks L00G; it does not permit skipping it or starting L01. Do not invent an `@docn` namespace, npm package, or license.

## 9. Completion and extensions

V1 is complete when the [PRD](docs/PRD.md) and L16 criteria are satisfied. Reports, quotes, CVs, certificates, menus, brochures, badges, RTL, font import, a freeform editor, AI generation, and a hosted API belong to a later roadmap. None may implicitly delay V1 or be advertised as available.
