# L15 — Final CI and deployment preparation

Status: **verified locally** at candidate `2574c96e264ba74939539e1d0c3ceb469efc6635`. Branch: `ci/release-delivery`, based on L14 merge `da10836b00240f4df1919863a6cca07de92a8ee8`.

Dependencies: L14. Requirements: NFR-06, NFR-09, NFR-10.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../RELEASE.md), [reference 2](../../TESTING.md), [reference 3](../../adr/0002-git-release.md).

## Scope and files

Make validation and publication reproducible without publishing while authorizations/destinations remain unknown.

Target files/responsibilities: .github/workflows, tooling/build, host configuration if authorized, docs/RELEASE.md.

## Stories and commits in order

### L15-S01 — `ci: gate releases with scoped checks and one build artifact`

- [x] Finalize quality/unit-tests/pdf-tests/consumer-tests/build/e2e-chromium and release-policy; verify shared dependency paths.
- [x] Pin actions, permissions, and environments; E2E/deploy consume one build with verified SHA/manifest.
- [x] Separate heavy tests; do not rerun validate:full in every job or expose secrets to forks.
- [x] Audit actual protections established in L00G and updated since L01; both rulesets require the seven observed checks. `release-policy` is prepared but deliberately not required until a real promotion run supplies evidence.

**Acceptance:** The CI graph explains which suite runs and which artifact will deploy; incorrect filters omit no evidence.

**Targeted verification:** Simulate triggers/local commands; actual CI run only with an authorized remote.

### L15-S02 — `build(site): prepare portable static deployment and registry caching`

- [x] Configure the local preview `SITE_URL`, registry origin and actual build assets; verify deep paths and the MIME types of every currently shipped asset category.
- [x] Separate HTML/current-catalog caching from immutable version/assets; validate headers and nonindexable previews.
- [x] Create a local preview command/procedure; host adaptation remains conditional on explicit selection.
- [x] Verify the registry through HTTP, not only local files; release documentation prohibits domain placeholders.

**Acceptance:** The built version works behind a static server; installation commands target the correct origin.

**Targeted verification:** Local HTTP or authorized preview smoke check: deep page, PDF, worker, fonts, registry; inspect headers of the environment actually tested.

### L15-S03 — `docs(release): document publication approval and rollback procedure`

- [x] Record remaining decisions: author/license, domain/host, production origin and publication permission; remote/visibility are already confirmed.
- [x] Retain the artifact release/rollback procedure, old-item immutability, and compatibility matrix.
- [x] Prepare the L16 checklist and available resources; do not create accounts/domains/tags in advance.

**Acceptance:** The maintainer can identify exactly what needs authorization; all local development is complete independently of these decisions.

**Targeted verification:** Procedure review and preview restoration test if available; no production rollback claim before the first release.

## Exit criteria

Pipeline ready; verified preview if authorized, otherwise precise local state. L16 waits for actually missing authorizations.

Update [status](../status.json) and create `docs/qa/L15.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No purchase, account, push, merge, domain, or package publication without explicit approval.
