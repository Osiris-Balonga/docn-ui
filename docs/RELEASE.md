# Git, CI, and delivery

Delivery procedure. L00G configures GitHub before L01; actual state is in [github.json](implementation/github.json). No hosting is implicit. See [ADR 0002](adr/0002-git-release.md) and [GITHUB](GITHUB.md).

## Commits and review

One branch per lot, with as few responsibilities as possible per commit. Lockfiles and generated shadcn components may be large; isolate these changes from application behavior. The lot specification defines commits, not a line quota.

At the end of a lot, attach targeted evidence, satisfied requirements, limitations, and ADR changes. No merging without approval. Do not commit generated HTML/PDF reports, secrets, or unlicensed assets.

## Progressive CI

L00G: required `branch-policy` on dev/main, no application suite. L01: `quality`, `unit-tests`, `build`, made mandatory after their first real run. The historical `unit-tests` job may keep its name, but runs unit/components/integration exactly once. L02 adds `pdf-tests`, L07 `consumer-tests`, and L06 the first `e2e-chromium`. Extend without duplicate suites; maintain a stable summary for conditional checks.

L15 makes final requirements explicit:

- `quality`: formatting/lint/types.
- `unit-tests`: three lightweight projects, diagnostic coverage in one run.
- `pdf-tests`: actual PDF suite and selected visual references, sharing outputs.
- `consumer-tests`: external installations on distribution changes; required for release.
- `build`: static build, manifest/hashes/assets; once per candidate.
- `e2e-chromium`: depends on the build, downloads and verifies the same artifact without rebuilding.
- `release-policy`: only for `dev -> main` promotion, verifying candidate SHA and authorization.

Minimum permissions `contents: read`, pinned actions with verified provenance, no secrets on fork PRs. Cancel superseded PR runs. Run heavy tests sequentially on small runners; no automatic retries hiding flakiness. Keep stable protection check names; do not require a check that has never run.

Path filters may skip consumer/PDF/browser work for planning-only documentation. Test shared dependency handling: lockfile, fonts, engine, and registry changes require the affected checks. Release uses no such exemptions.

## Hosting

Technical default: portable static build (`apps/www/out`). The host remains unconfirmed; Vercel, a static server, or another host are possible. Do not configure a provider simply because a plugin is available.

L15 provides a preview if the destination is authorized; otherwise provide a procedure and clearly labeled local HTTP validation. `SITE_URL` controls canonical URLs, sitemap, and registry; a release build rejects placeholder URLs. Previews are not indexed.

Long cache lifetimes for hashed assets and immutable versioned registry files; current HTML/catalog can be revalidated. Registry JSON/public archives needed by consumers are accessible without a session; configure CORS where documented use requires it, not as general permission for exfiltration.

Headers: correct MIME types, `nosniff`, Referrer-Policy, CSP derived from the actual build, local worker-src/font-src. Measure needs for `blob:` and Next inline scripts; do not use blanket `unsafe-*` allowances for convenience. The host applies static-export headers. Publication requires TLS.

## License and attribution

Propose a permissive code license only after confirming the author; do not infer a name from the Windows machine. Every font/image/dependency needs provenance and a license. No PDFx code/assets were copied during planning. Any future reuse must respect its license and retain required notices.

## Release v1.0.0

1. Verify and integrate all preceding lots, with candidate SHA evidence.
2. Complete functional/visual QA and document limitations; invent no hardware results.
3. Confirm license, identity, remote, URL, and publication authorization.
4. Create a release branch from `dev`; align catalog/registry versions and changelog. Preparation PR to `dev`, then a separate promotion PR `dev -> main` only. No npm publication is required in V1.
5. Fully validate and preview the exact candidate. Fix defects in separate commits and rerun invalidated evidence, plus final validation of the selected SHA.
6. Authorize promotion `dev -> main`, retain candidate ancestry, and deploy the qualified artifact.
7. Verify the public site: deep links, source, workers, fonts, download, registry, and one installation from the public URL.
8. Create an annotated tag and release on `main` only after confirmation; record tag/SHA/URL, checks, and limitations. Close L16 and set Done only after verified delivery. Later documentation updates follow docs/* -> dev -> main, never a direct push.

## Rollback

Keep the previous deployment's manifest and artifact. Restore its site version and current catalog without rewriting published registry items. An incompatible fix creates a new version. A first release without a predecessor documents withdrawal/maintenance and a preview restoration test; do not claim to have tested a nonexistent production rollback.
