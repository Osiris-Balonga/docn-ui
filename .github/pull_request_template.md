## Lot and issue

Lot: <!-- Lxx -->
Closes #<!-- actual lot issue; use Refs for L16 until public delivery -->

## Change and risk

<!-- What changed, why, and any limitations. Link completed stories and commits. -->

## Verification

<!-- Exact scoped commands, results and QA evidence. Do not run every suite for documentation. -->

<!-- Available since L01: pnpm quality (format/lint/types), pnpm test (lightweight projects once), pnpm build (static export). pnpm validate combines quality + test locally. Select the lowest sufficient scope; do not run both validate and its subcommands in CI. Empty unit/integration scopes are not passing suites. Heavy suites activate in later lots; see docs/TESTING.md. -->

- [ ] The PR targets dev; only this repository's dev can target main.
- [ ] Checks are appropriate for the changes; no unnecessary duplicate tests.
- [ ] No secret, user document or generated build is committed.
- [ ] Lot status, issue checklist and Project Status reflect actual progress.
- [ ] Merge, deployment and release authorizations are distinguished.
