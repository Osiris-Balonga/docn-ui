# L16 — Release candidate and v1.0.0 delivery

Initial status: **planned**. Branch: `release/v1.0.0`.

Dependencies: L15. Requirements: G6; PRD definition of done.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../RELEASE.md), [reference 2](../../PRD.md), [reference 3](../../TESTING.md).

## Scope and files

Qualify and publish the authorized candidate, distinguishing local preparation from public delivery. An unexpected fix gets its own commit.

Target files/responsibilities: Catalog/registry version, CHANGELOG.md, README, confirmed licenses, docs/qa/L16.md, and status.

## Stories and commits in order

### L16-S01 — `docs(release): prepare v1 documentation licenses and release notes`

- [ ] Confirm identity/license before creating notices; complete third-party licenses and the actual README.
- [ ] Release notes: fifteen compositions, qualified formats, actual features and limitations, migration if needed.
- [ ] Final QA checklist linking L14/L15 evidence and external decisions; no premature released status.

**Acceptance:** Public documents match the implemented product and confirmed distribution rights.

**Targeted verification:** Links/inventory/licenses; public version/origin checks, no additional application suite for text alone.

### L16-S02 — `chore(release): prepare docn-ui version 1.0.0`

- [ ] Version catalog/registry/metadata and immutable release paths; item dependencies target the same version.
- [ ] Fully validate the candidate SHA; verify preview/download comparison and installation from the candidate registry.
- [ ] Handle defects with separate referenced fixes; invalidate only affected evidence before final candidate validation.
- [ ] PR release/v1.0.0 to dev, then only same-repository dev to main promotion according to authorization. Preserve the exact artifact and SHA relationship; do not use Closes on L16 before public delivery.

**Acceptance:** The v1.0.0 candidate is verified; no development path or placeholder in public files.

**Targeted verification:** pnpm validate:full on the candidate, CI and preview if available. The reused build must carry the candidate fingerprint.

### L16-S03 — `docs(release): record verified v1 delivery and handoff`

- [ ] After authorized promotion/deployment, verify public origin, deep links, assets, download, and one public installation.
- [ ] Create tag/release only if authorized; record exact SHAs/tag/URL and report, no fabricated values.
- [ ] Set L16 released only when G6 is satisfied. If authorization is missing, remain verified_local or blocked with a clear next action.
- [ ] Write the maintenance guide, next family in the backlog, and rollback/fix-return procedure through dev. Close L16, set Project Done, and record actual links only after G6; post-release records also follow a PR to dev.

**Acceptance:** G6: verified public product and informed maintainer; otherwise explicitly state delivery is incomplete.

**Targeted verification:** Actual public smoke check, representative public installation, version-ID reads, final report review. Do not repeat fifteen identical public exports.

## Exit criteria

V1 delivered only after evidence and authorization. Subsequent work does not implicitly authorize additional features.

Update [status](../status.json) and create `docs/qa/L16.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No unnecessary npm publication, fake GitHub account, or release claimed successful solely from a local build.
