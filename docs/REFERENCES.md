# Sources and inspiration

Consulted: 2026-08-28. Verify versions at bootstrap; these links are references, not compatibility guarantees tested for docn-ui.

## paint-3d / DrawMotion — read-only

Local path: `C:/Users/Dell/Documents/Dev Projects/paint-3d`.

- First commit: `c2cbdd5`, `chore(repo): initialize DrawMotion governance`.
- Initial file: `git show c2cbdd5:IMPLEMENTATION_PLAN.md`; 656 lines covering governance, 12 lots, exact commits, criteria, and delivery.
- Additional initial documents: `PRODUCT.md`, `DESIGN.md`, stack/Git ADRs.
- Final state inspected: `8e370cd5e6802be762bf14a192a3e68cbb52fa54`, branch `codex/pwa-offline`, clean working tree when read.
- User instruction added during planning: specifically use final `docs/TESTING.md`, `package.json`, `vitest.config.ts`, and `playwright.config.ts` as references for separate scopes and avoiding unnecessary tests.

Adopted: sequential lots, tests by responsibility, atomic commits, status/evidence, local validation distinct from delivery. Adapted: separate lot files, consistent `dev/main`, no squash that removes the requested history, local work initially possible without a remote, lightweight `validate`, explicit `validate:full`. The later request makes L00G mandatory before L01 in connected mode. Not adopted: webcam, gestures, MediaPipe, PWA, and DrawMotion-specific constraints.

Only `git log/show/ls-tree/status` and file reads were performed; no checkout, reset, installation, or writes in this project.

## Munganga — read-only GitHub reference

Maintainer-requested reference: [Osiris-Balonga/munganga](https://github.com/Osiris-Balonga/munganga), spelled "mungaga" in the request. API inspection on 2026-08-28, dev HEAD `ec51e245c90de3d11192338cd9477c146c38cafa`. No reference files, issues, Projects, or settings were changed.

Inspected: `CONTRIBUTING.md`, PR template, `.github/workflows/branch-policy.yml`, protect-dev (`20957675`) and protect-main (`20957673`) rulesets, [Munganga MVP Project](https://github.com/users/Osiris-Balonga/projects/1), fields, sample issues, and seven milestones.

Observations: dev default, squash only, mandatory PRs/reviews (1 on dev, 2 on main), no bypass. Its workflow permits dev or hotfix/* to main, but neither inspected ruleset lists required status checks. The Project has separate Status and Workflow fields; one sampled item shows Done/Backlog. This is not an exhaustive audit.

docn-ui adaptation: similar milestones/issues, but only same-repository dev may target main, a required check from a trusted base, preserved merge commits, a solo policy without invented reviewers, and one Status. Never copy Munganga IDs or members.

## GitHub — primary sources for L00G

- [Available rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets): PRs, required checks, source app, force-push and deletion prevention.
- [Actions events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target): trusted context and pull_request_target precautions.
- [PRs and issue closing](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue): the default branch's role.
- [Native automations](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations) and [Projects permissions](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions): mechanisms and repository-token limitations.

## PDFx

[Site](https://pdfx.akashpise.dev/) and [corrected repository link](https://github.com/akii09/pdfx). The inspected registry exposes 24 components and 10 blocks: six invoices and four reports. It informed positioning without code copying.

[Registry source](https://github.com/akii09/pdfx/blob/main/apps/www/src/registry/index.json); [architecture](https://github.com/akii09/pdfx/blob/main/ARCHITECTURE.md). The identified gap concerns ready-to-use ticket/card/label templates; it does not prove that the engine cannot use custom sizes.

## Primary technical sources

- [shadcn — Next.js installation](https://ui.shadcn.com/docs/installation/next): site integration.
- [shadcn — registry](https://ui.shadcn.com/docs/registry) and [item schema](https://ui.shadcn.com/docs/registry/registry-item-json): distribution, qualified dependencies, types, targets.
- [Next.js — static export](https://nextjs.org/docs/app/guides/static-exports): also read directly as official Markdown after web extraction failed; build-time generation and constraints without a server runtime.
- [React-pdf — Page](https://react-pdf.org/docs/v4/components/page): dimensions and optional height.
- [React-pdf — advanced features](https://react-pdf.org/advanced) and [fonts](https://react-pdf.org/fonts): pagination and asset compatibility.
- [PDF.js — official examples](https://mozilla.github.io/pdf.js/examples/): reading and rendering PDF bytes.

These capabilities must be demonstrated together in L02/L07. Official documentation does not replace testing the exact selected setup.
