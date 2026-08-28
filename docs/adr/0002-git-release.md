# ADR 0002 — Lots, commits, and publication

Date: 2026-08-28. Status: revised decision following the public GitHub setup request; details and evidence in [GITHUB](../GITHUB.md).

## Decision

`main` is stable; `dev` is integration and the GitHub default branch. One branch per lot, PRs to `dev`, only same-repository `dev` to `main`. No hotfix exception. L00G initializes public `Osiris-Balonga/docn-ui`, protections, Project, and issues before L01.

Merge commits only, preserving SHAs and detailed commits. Disable squash, rebase merge, required linear history, and auto-merge. No ruleset bypass; mandatory PRs and checks. Zero third-party reviews required in solo mode; strengthen this when a distinct reviewer is available.

## Offline mode

Local validation differs from CI/merge. An explicit request to continue locally permits branches stacked on the last verified lot. Document base/head. With a remote, process PRs sequentially and retarget after merging; do not force history for convenience.

## Authorizations

The current request authorizes the public repository, protections, Project, issues, and configuration-branch pushes. Initial ref creation before rule activation is a one-time exception documented by SHA; later changes require PRs. Merging, licensing, purchases, and site publication are not implicitly authorized. A ready PR remains an intermediate deliverable.

## Difference from the references

DrawMotion's first plan used `main/production`, then evolved to `dev/main`. docn-ui chooses one convention from the start and does not copy conflicting historical instructions.

Munganga informs the Project, milestones, templates, and protections, but its squash merges, hotfix exception, dual Status/Workflow fields, and review quotas are not adopted. Here, branch-policy is required in rulesets. Validate the source **branch and repository**, not the name alone.
