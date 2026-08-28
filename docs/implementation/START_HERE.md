# Start or resume implementation

## Current state

L00 is locally verified. [L00G](lots/L00G-github-governance.md) is merged through PR #9; [L01](lots/L01-bootstrap.md) is verified and in review through PR #21 on `chore/bootstrap-workspace`, based on `07dd743db42c293ed59f99e6ff734eaef94ea86b`. The plan contains 18 lots and 60 stories; L01–L16 IDs are unchanged. Read [GITHUB](../GITHUB.md), [status.json](status.json), [github.json](github.json), and the latest evidence. No implicit hosting or license choice.

Write everything in English: documentation, plans, acceptance criteria, QA, UI copy, comments, and GitHub content. This confirmed requirement also applies to future agents. French/English document-data support remains part of the technical scope.

## Instruction for an agent

Current handoff: review [PR #21](https://github.com/Osiris-Balonga/docn-ui/pull/21), [L01 QA](../qa/L01.md), and [issue #3](https://github.com/Osiris-Balonga/docn-ui/issues/3). The four required checks pass; both protected branches require them. Wait for an authorized L01 merge, read its SHA/date, set L01 merged/Done, then L02 Ready. Start `feat/pdf-rendering-spike` from the resulting origin/dev. Do not repeat bootstrap, recreate issues, or push to dev/main. Speak French to the maintainer; write project artifacts in English.

> Read AGENTS.md, IMPLEMENTATION_PLAN.md, and docs/implementation/status.json. Implement the next eligible lot according to its specification, stories, and commits. Keep shadcn/ui for the site and PDF components separate. Add only tests justified by uncovered risks, using the scoped commands in docs/TESTING.md. Verify the result; update status, QA report, issue, and Project Status at each transition; then report commits and the next lot. Write all project content in English. Do not modify paint-3d or publish anything without authorization.

To request several local lots at once, specify IDs and explicitly authorize local continuation. Keep commits/branches and evidence separate. This documentation is not itself that authorization.

## Initial L00 procedure (already executed)

1. Verify the active directory is `docn-ui` and inspect files/Git.
2. Read the [rules](../../AGENTS.md) and [plan](../../IMPLEMENTATION_PLAN.md).
3. Read [status.json](status.json): initially all lots were `planned`.
4. Open [L00](lots/L00-governance.md), then only its references.
5. Set L00 `in_progress` when work actually starts; create its commits without inventing results.
6. Write `docs/qa/L00.md` using the [template](templates/QA_REPORT.md), then record the actual state reached.

## Resume after interruption

Compare JSON state with Git and the latest report. Inspect partially written stories before executing them again. Do not assume a checked box proves a test. Resume at the first missing acceptance criterion instead of restarting the entire lot.

## Quick verification guide

Pure function → `test:unit`. UI interaction → `test:components`. Module coordination → `test:integration`. Actual document → `test:pdf`. Installed source → `test:consumers`. Browser journey → `test:e2e`. Selected visual regression → `test:visual`.

Commands activate progressively: L01 provides the lightweight projects (one real component suite today), quality, static build, and the sequential aggregate. PDF/consumer/browser/visual scopes remain unavailable until their first real suites. The [full contract](../TESTING.md) documents activation and how to avoid duplicate collection.
