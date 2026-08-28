# L00 — Governance and first documentation commit

Initial status: **planned**. Branch: main (local bootstrap), then dev.

Executed on 2026-08-28: **verified_local**. See the [L00 report](../../qa/L00.md) and [status](../status.json).

Dependencies: none. Requirements: G0; cross-cutting governance.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../RELEASE.md), [reference 2](../../adr/0002-git-release.md).

## Scope and files

Turn the documentation directory into a clean Git baseline after an implementation request. Do not automatically create a remote repository.

Target files/responsibilities: Root, docs/, .gitignore, .gitattributes, .editorconfig; no application code.

## Stories and commits in order

### L00-S01 — `docs(plan): establish docn-ui implementation baseline`

- [x] Reread the plan and actual directory state; do not rerun generation that overwrites this documentation.
- [x] After authorization to begin, initialize local Git on main if absent; do not configure an invented Git identity. Add ignores for builds, node_modules, secrets, and .artifacts, text attributes, and editor configuration.
- [x] Verify links, lot IDs, and absence of artifacts/private data; commit only governance and documentation.
- [x] Create dev at the initial commit for subsequent lots; record the actual SHA in the next report. Remote/visibility/license remain external decisions.

**Acceptance:** The first commit contains no simulated site or application package. The plan is navigable; initial state claims no implemented lot.

**Targeted verification:** Documentation checks and git diff --check; no application test command.

## Exit criteria

### Execution record after the initial commit

The story commit cannot contain its own SHA or prove later creation of `dev`. A supplementary documentation commit, `docs(progress): record verified governance baseline`, on `dev`, therefore records post-commit checks and the initial SHA without amendment. It is not a new application story or the start of L01. Record its own SHA in the next status update.

G0: an actual first documentation commit and an explained working tree. Missing GitHub access does not block local bootstrap.

Update [status](../status.json) and create `docs/qa/L00.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No push, remote creation, branch in paint-3d, installation, or publication.
