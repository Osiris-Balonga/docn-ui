# Agent instructions — docn-ui

## Mission and authority

Build the product described in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), one lot at a time. Explicit maintainer requests take precedence over the plan. Do not confuse a technical recommendation with permission to publish.

The maintainer authorized local implementation, then the public GitHub setup for `Osiris-Balonga/docn-ui` on 2026-08-28: repository, protections, Project, issues, and tracking. Execute L00G before L01 according to [GITHUB.md](docs/GITHUB.md). This authorization covers the documented remote bootstrap and work-branch pushes/PRs for this setup; it does not cover automatic merging, deployment, npm publication, license selection, or domain purchases.

## Language

The maintainer explicitly requires English throughout the project. Write all documentation, plans, lot specifications, acceptance criteria, QA reports, agent instructions, comments, UI copy, commit messages, and GitHub issues, PRs, milestones, and Project content in English. Apply this rule to every future addition or update. Preserve stable IDs, commands, paths, and historical commit hashes. Do not rewrite Git history to translate old commits.

English project prose does not remove the planned ability to render user document data in French and English. Locale support and user-provided content are separate from the language of the project.

## Required reading at the start of a lot

1. [Status](docs/implementation/status.json) and the master plan.
2. [Product](PRODUCT.md), [design](DESIGN.md), and [PRD](docs/PRD.md).
3. [Architecture](docs/ARCHITECTURE.md), ADRs, and specifications referenced by the lot.
4. The lot specification, the preceding lot's exit criteria, and associated evidence.

Do not reread every lot in detail on every resumption. Do not treat API examples as existing code.

## Execution protocol

- Inspect Git and existing changes before writing; preserve user work.
- Follow the lot's stories and commit messages. Use one coherent, tested intention per commit; include behavior tests in the corresponding commit.
- Do not create deliberately failing commits. An unplanned fix receives a separate `fix(...)` commit and an explanation in the evidence.
- Do not accumulate an entire lot in a final commit. The detailed commits are part of the deliverable.
- Never set `verified_local` without the required tests and evidence. Starting a command is not successful verification.
- Update `docs/implementation/status.json` and `docs/qa/Lxx.md` in the lot's commits; never record a fake SHA. A SHA may be recorded in the next commit without artificial amendments.
- Connected mode: one branch per lot, PR to `dev` (the default branch), and wait for an authorized merge before the next lot. No direct pushes to `dev/main`, except the initial L00G ref creation. Only `dev` from the same repository may target `main`, with no hotfix exception. Merge commits only; no bypass or automatic merge.
- Read the lot issue and `docs/implementation/github.json` at the start. Update checklists/SHAs/evidence after each story and the Project Status at each transition. `verified_local` is not Done; close after an observed merge, except historical L00 and L16 after delivery. Do not create duplicates or overwrite human content.
- Without a remote: local commits and verification are possible when implementation is authorized. Keep sequential branches based on the last verified lot and record `verified_local`; do not claim a PR or delivery. Document branch bases for later PRs.
- Explicitly report time limits, unavailable tests, or missing external dependencies; never replace real evidence with a fabricated screenshot.

## Boundaries and quality

- Use actual shadcn/ui for the site; sources belong in `apps/www/src/components/ui`. Base UI is the default in ADR 0001; do not mix components from different bases.
- No DOM, Tailwind, or shadcn components in PDF documents. Documents use `@react-pdf/renderer` and their own tokens.
- Keep one source for each template; the catalog, preview, export, and registry derive from it.
- Render user content locally in the browser; do not add a server generation route, telemetry, or remote storage without a new decision.
- Do not evaluate user-entered JSX/JavaScript. Accept only validated JSON and permitted images.
- No generic multiformat engine abstraction, CMS, proprietary CLI, authentication, or SaaS billing in V1.
- No new dependency without a reason, license review, and bundle impact assessment. Pin exact versions after L01 and commit the lockfile.
- Test in proportion to behavior: calculations and geometry, actual PDF content, visual checks, user journeys, and installation outside the monorepo.
- Explicit maintainer instruction: do not multiply unnecessary tests. Follow [TESTING.md](docs/TESTING.md), choose the lowest sufficient scope, reuse fixtures, and do not retest shadcn. No Cartesian product of variants and no full suite after every commit.
- Do not weaken thresholds, disable checks, or regenerate visual references merely to make CI pass.
- Test responsive behavior, keyboard access, and reduced motion.
- Do not claim PDF/X, CMYK, PDF/UA, tax compliance, or secure ticket validity.

## Workspace safety

`C:/Users/Dell/Documents/Dev Projects/paint-3d` is a read-only reference. Never write there, switch branches, create a worktree, install, commit, or clean it. Do not import its camera/MediaPipe constraints into docn-ui.

`Osiris-Balonga/munganga` and its Project are also read-only references. Do not change rules, issues, labels, fields, or permissions in those resources.

No `git reset --hard`, `git clean`, force pushes, deletion of user files, or history rewriting. Never commit secrets, personal documents, builds, or large reports.

## End-of-lot report

Report completed lots/stories, created commits, executed tests and results, evidence, deviations, limitations, and the next permissible step. Distinguish `verified_local`, `merged`, and `released`.
