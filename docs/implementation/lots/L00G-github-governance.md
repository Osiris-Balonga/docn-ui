# L00G — GitHub, protections, and project tracking

Initial status: **planned**. Branch: `chore/github-governance`.

Execution: configuration verified, PR #9 `in_review`, no merge. See [QA](../../qa/L00G.md).

Dependencies: L00. Requirements: GOV-01 through GOV-04; extended G0. Inserted before L01 without renumbering existing stories.

## Reading and entry criteria

Read [AGENTS](../../../AGENTS.md), [the plan](../../../IMPLEMENTATION_PLAN.md), [GITHUB](../../GITHUB.md), [ADR 0002](../../adr/0002-git-release.md), [TESTING](../../TESTING.md), status, and L00 evidence. Public target `Osiris-Balonga/docn-ui` is confirmed; license and deployment remain separate.

## Scope and files

Create/configure the repository and Project, then populate issues from lot specifications. No Next.js/PDF code or npm installation. All documentation and GitHub content must be in English.

Target files/responsibilities: .github/workflows/branch-policy.yml, .github/rulesets, .github/ISSUE_TEMPLATE, PR template, CONTRIBUTING.md, tooling/github, docs/implementation/github.json, status, and QA.

## Stories and commits in order

### L00G-S01 — `chore(github): add trusted branch policy and contribution templates`

- [x] Create the source/base check using trusted code, without executing the proposed PR; test a useful case table with dependency-free Node.
- [x] Version both expected rulesets without bypasses, requiring PRs and branch-policy; merge commits preserve history.
- [x] Add issue/PR templates and CONTRIBUTING with test scopes, issue/lot links, evidence, and tracking protocol.

**Acceptance:** Governance files are ready to seed main/dev; the check rejects unauthorized sources and fork dev branches targeting main.

**Targeted verification:** Documentation checks, `git diff --check`, `node --test tooling/github/branch-policy.test.mjs`. No application suite.

### L00G-S02 — `chore(github): record protected repository bootstrap`

- [x] Create the empty public repository, then initial refs at the S01 SHA; record the one-time bootstrap exception without rewriting L00.
- [x] Set dev as default, allow only merge commits, disable auto-merge; activate protect-dev/protect-main and read their effective content.
- [x] Record actual URLs/IDs and obtained permissions; subsequent traceability commits stay on the lot branch with a PR.

**Acceptance:** Actual repository, two protected branches, no bypass list, and a required check; nothing published to a host.

**Targeted verification:** API reads of repository/rulesets/branches; verify the check's source app and lack of bypass. Complete the actual PR test in S04.

### L00G-S03 — `chore(project): seed milestones and lot issue tracking`

- [x] Create/reuse the public docn-ui V1 Project linked to the repository, one Status, Lot/Priority, and native fields; store actual IDs.
- [x] Create limited labels, seven milestones, and 18 lot issues with checklists for 60 stories; historical L00, other states justified by evidence.
- [x] Ensure idempotence with stable markers/mapping; preserve human content and existing checkboxes. Document agent updates and Projects permissions without adding tokens to workflows.

**Acceptance:** Each lot has exactly one issue and item; dependencies, commits, milestones, and status are readable; no invented dates or assignments.

**Targeted verification:** Compare API inventory with specifications, links, duplicates, options/IDs, and states; read back after mutations. No PDF/browser suite.

### L00G-S04 — `docs(github): record policy checks and project handoff`

- [x] Verify rejected direct pushes to each branch using an empty probe commit, without deletion/force; verify a forbidden PR to main and a normal PR to dev.
- [x] Read actual checks and merge state; close the negative PR without merging. Keep the setup PR to dev linked to its issue.
- [x] Update status, QA, GitHub tracking, and handoff guide with actual evidence. Do not mark merged before approval and an observed merge.

**Acceptance:** Protections have actual evidence and the Project reflects the PR; L01 waits for L00G integration. Any limitations are explicit.

**Targeted verification:** Server rejection, checks, PR metadata, final API audit; no force-push/deletion attempt or automatic merge.

## Exit criteria

Extended G0: remote configuration verified, initial tracking created, documentation PR ready. Remain `in_review` until authorized merge; L01 depends on that integration. A local check or JSON file is not evidence of active protection.

## Out of scope

Changes to Munganga/paint-3d, arbitrary license selection, site deployment, purchases, Projects secrets in CI, merging without approval, or temporarily disabling protection.
