# GitHub — repository, protections, and tracking

Decision on 2026-08-28: **public `Osiris-Balonga/docn-ui` repository**, requested for an open-source project. The maintainer explicitly selected MIT on 2026-09-02; public visibility before that decision did not grant a license. Execute GitHub governance in [L00G](implementation/lots/L00G-github-governance.md), before L01. Actual IDs and results belong in [github.json](implementation/github.json), [status.json](implementation/status.json), and the lot report. All repository and GitHub prose must be in English, including issue bodies, milestones, PRs, and evidence.

## 1. Repository and branches

- `dev` is the default and integration branch; `main` receives stable promotions.
- Lot branches start from `dev` and target it through PRs. The only permitted source for `main` is **`dev` from the same repository**, checked by repository ID and branch name.
- No `hotfix/*`, `release/*`, fork branch named `dev`, or other branch may target `main` directly. Urgent fixes follow `fix/* -> dev -> main`.
- After promotion, synchronize `main -> dev` through a PR without new changes if needed. Release branches first target `dev`; a separate `dev -> main` PR promotes the candidate.
- Merge commits only; disable squash and rebase merge to preserve story SHAs. Do not require incompatible linear history.
- Disable auto-merge and automatic branch deletion: do not risk deleting `dev` after promotion. Explicitly clean only merged work branches.
- Enable Issues and Projects; no implicit Wiki, Pages, hosting, or package publication.

## 2. Expected active rulesets

Two rulesets target exactly `refs/heads/dev` and `refs/heads/main`: `protect-dev` and `protect-main`.

| Rule | dev | main |
| --- | --- | --- |
| Required PR | Yes | Yes |
| Branch deletion | Forbidden | Forbidden |
| Force push | Forbidden | Forbidden |
| Resolved conversations | Yes | Yes |
| Permanent bypasses, including administrators/apps | None | None |
| Required check from L00G | `branch-policy` | `branch-policy` |
| Check source app | GitHub Actions, actual ID read through API | Same source |
| Merge method | Merge commit | Merge commit |

In solo mode, require zero third-party approvals; PRs and checks remain mandatory. If a distinct reviewer joins, explicitly decide approval counts, stale-review dismissal, and latest-push approval. Do not copy Munganga's 1/2 quotas that would block a solo author; do not invent a CODEOWNER.

Do not enable `restrict_updates` without a need: it may also prevent authorized merges. Do not add an administrator bypass to unblock CI. Administrators can technically edit rules; the agent is not authorized to do so to evade a failure.

Branch rulesets are available for public repositories on GitHub Free; read activation back through the API instead of inferring it from versioned JSON files. [GitHub rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

## 3. PR direction check

`.github/workflows/branch-policy.yml` is a lightweight governance check, not an application suite. It runs on opening, reopening, synchronization, base edits, and leaving draft mode, without path filters.

Use `pull_request_target` to read policy from the trusted base. If checkout is needed to reuse the tested function, explicitly pin it to `pull_request.base.sha`, do not persist credentials, and check out only governance files. **Never check out, build, install dependencies from, or execute scripts/artifacts from the proposed branch** in this workflow. Permissions: `contents: read`, no writes or Project secrets. Read the payload as JSON from `GITHUB_EVENT_PATH`; never interpolate it into a shell command. [Event and precautions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target).

Policy: `dev` accepts planned prefixes (`feat/`, `fix/`, `chore/`, `docs/`, `test/`, `ci/`, `build/`, `refactor/`, `release/`), including forks; `main -> dev` is limited to the repository itself. Missing input, unknown bases, and forbidden sources explicitly fail. For `main`, also compare `head.repo.id` and `base.repo.id` with the current repository.

An existing workflow omitted from required checks does not protect merges. Check names must be unique; verify their PR association and GitHub Actions origin with a real PR. The check alone does not prove release authorization; human approval remains separate. L15 adds a second `release-policy` job only for `main` promotion PRs. That job reads its tested policy from `github.workflow_sha` (the protected default-branch workflow revision), fetches the live `dev` ref through the read-only API, and requires an exact head SHA plus the maintainer-controlled `release-approved` label. Label changes retrigger the workflow. Do not require this context in `protect-main` until its first real GitHub Actions run has been observed.

## 4. Bootstrap without rewriting history

1. Inspect Git, target, existing identity, and access; never reinitialize an existing remote repository.
2. Prepare the plan, templates, rulesets, and trusted workflow in local commits. Verify links, policy, and absence of secrets.
3. Create an empty public repository without a generated README/license. Initially create `main` and `dev` at the same documentation bootstrap SHA, descending from L00 and already containing the policy. Retain old SHAs; no force or rewriting existing refs.
4. Initial ref creation is the only bootstrap exception to PRs. Record its SHA; it authorizes no later direct push. Immediately activate both rulesets, set `dev` as default, and explicitly enable GitHub Actions. If runs do not appear despite API permissions, inspect the UI activation message; never remove the required check.
5. Subsequent commits, including configuration evidence, go to `chore/github-governance` with a PR to `dev`. No merging without maintainer approval. Never suspend protections to complete the lot.
6. Verify through API reads and control PRs. Push probes use an isolated empty commit; unexpected success stops the audit, without force reset or deletion to hide the incident. A `--dry-run` alone does not prove server rejection.

## 5. Progressive CI and required checks

L00G: only `branch-policy`. L01 adds `quality`, `unit-tests` (the active lightweight scopes once), and `build`, then requires them after a successful real run. L02, L06, and L07 add PDF, E2E, and consumers respectively. L15 verifies everything and adds `release-policy` for promotions; it does not defer initial protections to project completion.

For conditional heavy suites, a stable summary check verifies success or explicit non-applicability; do not require a workflow that disappears due to `paths-ignore`. Release runs all scopes. CI must not run both `validate:full` and all its subcommands. Update rules after reading actual check names and source apps, never based on fabricated results.

## 6. Project and backlog

A public **docn-ui V1** Project linked to the repository contains work issues. Create **one issue per lot (18)**; stories and commits are issue checklists, not separate issues by default. A sub-issue is useful only for independent work, a distinct bug, or separate assignment.

Each issue has a stable `<!-- docn:lot:Lxx -->` marker, a `[Lxx] …` title, dependencies, a specification link at the appropriate SHA/branch, stories/commits, acceptance criteria, targeted verification, and evidence. Import L00 as completed history without inventing an old PR. Keep L00G open until validation and merge of its documentation PR.

Fields: one **Status** (`Backlog`, `Ready`, `In progress`, `In review`, `Blocked`, `Done`), `Lot` (text), `Priority` (`P0`, `P1`, `P2`). Use native Assignees, Labels, Milestone, and Linked pull requests. No second `Workflow` field that could diverge from Status.

Limited labels: `type:lot`, `type:bug`, `type:enhancement`, `type:chore`; `area:governance`, `area:site`, `area:pdf`, `area:registry`, `area:docs`, `area:qa`, `area:delivery`. Priority belongs in its field, not a competing label. Never automatically assign Munganga collaborators.

| Milestone | Lots |
| --- | --- |
| G0 — Governance | L00, L00G |
| G1 — PDF feasibility | L01, L02 |
| G2 — First complete business card | L03, L04, L05 |
| G3 — Standalone distribution | L06, L07 |
| G4 — V1 catalog | L08, L09, L10, L11 |
| G5 — Qualification | L12, L13, L14 |
| G6 — v1.0.0 delivery | L15, L16 |

No invented dates, estimates, or sprints. Default table view; Status board and milestone view if the available UI/API supports configuration. Do not claim views were created without reading them back; missing views do not prevent table-based tracking.

## 7. Agent updates

| Moment | GitHub and documentation action |
| --- | --- |
| Before the lot | Read issue and local state; Ready only when dependencies are integrated, then In progress at actual startup |
| After a verified story | Check the story, link the actual SHA and targeted evidence; do not close the lot |
| PR opened | `Closes #N` in the PR to dev; link it, set In review, record URL/number |
| Actual blocker | Record reason and resumption condition, set Blocked; no false success or protection changes |
| Authorized merge into dev | Read merge SHA/date; local state merged, issue closed, Status Done |
| L16 release | Done/released only after public verification; do not close on the preparation PR alone |

Since `dev` is the default branch, closing keywords in PRs targeting it can close issues at merge. For L16 use `Refs #N` until delivery, then close explicitly. [Issue closing](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).

Native automations help with Project addition/closure but do not prove acceptance or release. The agent explicitly verifies and synchronizes fields at each transition; no recurring automation is needed. Do not close an issue simply because someone drags a card to Done.

The repository `GITHUB_TOKEN` cannot access a user Project. Use the already authorized `gh` session; if permissions are missing, request access without extracting a token. Future server automation would need an app or dedicated token with minimal permissions, never exposed to an untrusted PR. [Projects access](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions).

## 8. Synchronization and resumption

Lot specifications define work; `status.json` and QA provide evidence; GitHub provides shared tracking. `github.json` maps actual repository, Project, field/option, milestone, issue, item, and PR IDs. Never reuse Munganga IDs.

Before creating anything, search by recorded ID, then lot marker; stop if multiple matches exist. Update only managed sections, preserving comments, human additions, and verified checkboxes. Read state back after each mutation; resume partial failures using existing IDs. No destructive regeneration, bulk deletion, duplicate issues, or arbitrary moves to Backlog.

Administration commands stay separate from application tests. Pass multiline bodies through files/structured APIs. Administrative permissions serve the requested configuration, not merging, site publication, or bypassing CI.
