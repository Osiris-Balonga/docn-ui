# Git, CI, and delivery

Delivery procedure. L00G configures GitHub before L01; actual state is in [github.json](implementation/github.json). No hosting is implicit. See [ADR 0002](adr/0002-git-release.md) and [GITHUB](GITHUB.md).

## Commits and review

One branch per lot, with as few responsibilities as possible per commit. Lockfiles and generated shadcn components may be large; isolate these changes from application behavior. The lot specification defines commits, not a line quota.

At the end of a lot, attach targeted evidence, satisfied requirements, limitations, and ADR changes. No merging without approval. Do not commit generated HTML/PDF reports, secrets, or unlicensed assets.

## Progressive CI

L00G: required `branch-policy` on dev/main, no application suite. L01: `quality`, `unit-tests`, `build`, made mandatory after their first real run. The historical `unit-tests` job keeps its name, but now runs the unit and component projects exactly once; L14 removed the empty integration scope after the editor left V1. L02 adds `pdf-tests`, L07 `consumer-tests`, and L06 the first `e2e-chromium`. Extend without duplicate suites; maintain a stable summary for conditional checks.

L15 makes final requirements explicit:

- `quality`: formatting/lint/types.
- `unit-tests`: the unit and component projects, collected once in one run.
- `pdf-tests`: the actual PDF suite followed by the selected exact visual references.
- `consumer-tests`: external installations on distribution changes; required for release.
- `build`: static build, manifest/hashes/assets; once per candidate.
- `e2e-chromium`: depends on the build, downloads and verifies the same artifact without rebuilding.
- `release-policy`: only for `dev -> main` promotion, verifying that the PR head is the live `dev` SHA and carries the maintainer-controlled `release-approved` label.

Minimum permissions `contents: read`, pinned actions with verified provenance, no secrets on fork PRs. Cancel superseded PR runs. Run heavy tests sequentially on small runners; no automatic retries hiding flakiness. Keep stable protection check names; do not require a check that has never run.

The consumer job reports explicit non-applicability when no distribution path changed. Its filter includes the lockfile, workspace/compiler configuration, fonts, document sources, template generation, asset generation, registry generation and the consumer test itself. The PDF, visual, build and browser jobs currently remain unconditional, so no release evidence disappears behind a path filter. Release uses no exemptions.

The `release-policy` workflow is present and its exact GitHub Actions context is
required by the active `protect-main` ruleset. It succeeded on the authorized
v1.0.0 promotion PR #75, whose head was the live `dev` SHA and which carried
the maintainer-controlled `release-approved` label. Applying that label remains
a release authorization action, not a routine implementation step.

## Hosting

Technical default: portable static build (`apps/www/out`). The maintainer selected Vercel for the public site and authorized the non-indexed v1.0.0 production sequence at `https://docn-ui.vercel.app`. `vercel.json` pins the repository's package manager, exports the monorepo output, and maps the portable security/cache policy to provider headers. The code and documentation license is MIT.

L15 provided a local preview before the destination was authorized. Run `pnpm build:preview`, then `pnpm preview:verify`; `pnpm preview` keeps the verified build available at `http://127.0.0.1:4173`. The build fingerprint records its source inputs, complete static-output digest, file/byte counts, `SITE_URL`, registry origin and indexing mode. `SITE_URL` controls canonical URLs and sitemap output. Previews are not indexed.

For v1.0.0 production, configure the Vercel build with `SITE_URL=https://docn-ui.vercel.app`, `DOCN_REGISTRY_ORIGIN=https://docn-ui.vercel.app/r/v1.0.0/`, and `DOCN_ALLOW_INDEXING=false`. Build locally with `vercel build --prod`, deploy the resulting `.vercel/output` with `vercel deploy --prebuilt --prod --skip-domain`, and verify the generated HTTPS URL before `vercel promote`. After promotion, repeat the probes against the stable alias and perform one installation from the public versioned registry. Never promote a build whose fingerprint does not match the reviewed source SHA.

Analytics remains disabled unless both `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` are configured. The project token is public ingestion configuration, not a personal API credential. Before enabling it, configure the PostHog EU project for Cookieless server hash mode, no person profiles, no autocapture or replay, and discarded IP data. Never add the private Query Read key to this repository or public Vercel project.

Vercel Web Analytics is included independently through the same-origin `@vercel/analytics` integration. Enable Web Analytics for the public Vercel project before promotion. It supplies anonymous page views, daily traffic, country, route, and referrer aggregates without a cookie banner. Keep any Vercel access token used to query those aggregates exclusively in the private dashboard Preview environment.

Static builds emit a canonical URL and sitemap entry for every public page. Without `SITE_URL`, canonicals use the loopback development origin and the complete site emits `noindex, nofollow` plus `Disallow: /`. A publication candidate becomes indexable only when it has an authorized `SITE_URL` and `DOCN_ALLOW_INDEXING=true`. Generated preview assets and development registry paths remain excluded from crawlers. Do not enable indexing merely to test a preview deployment.

Long cache lifetimes for hashed assets and immutable versioned registry files; current HTML/catalog can be revalidated. Registry JSON/public archives needed by consumers are accessible without a session; configure CORS where documented use requires it, not as general permission for exfiltration.

Portable header and cache behavior is defined in `tooling/deployment/static-policy.mjs`: current HTML/PDF/catalog content revalidates, the development registry is never stored, and hashed Next assets plus future versioned registry items are immutable for one year. The local verifier checks HTML, PDF, JSON, WOFF2 and JavaScript MIME types plus `nosniff`, CSP and cache headers. The current catalog opens generated preview images and does not ship the otherwise unused `PdfCanvas`, so this build has no standalone PDF.js worker asset to probe; `worker-src 'self' blob:` remains explicitly bounded for a future reachable worker. A selected host must reproduce these policies and serve over TLS before publication.

## License and attribution

The maintainer selected MIT on 2026-09-02 for code and documentation copyrighted by Emmanuel Osiris Balonga. The root `LICENSE` is authoritative, and registry installations carry the same notice under `docn/LICENSE`. Font, image, generated-content, and dependency licenses remain separate obligations. No PDFx code/assets were copied during planning. Any future reuse must respect its license and retain required notices.

## Release v1.0.0

### Confirmed release decisions and remaining actions

- No author or code-license decision remains: Emmanuel Osiris Balonga and MIT are confirmed.
- Any custom domain or billing action. Vercel and the `docn-ui.vercel.app` production origin are confirmed.
- Permission to make the site indexable. The authorized v1.0.0 production deployment remains non-indexed.
- Official v1.0.0 continuation is authorized. PR #75 carried
  `release-approved`, merged exact `dev` to `main`, and the matching production
  artifact was promoted. The annotated tag and GitHub Release are the remaining
  repository records; neither exists yet.

Repository visibility is already public, but that grants none of the decisions above. No npm publication is planned for V1.

The release scope and limitations are recorded in the [changelog](../CHANGELOG.md): eighteen templates across six families. The dated notes do not replace the final tag and GitHub Release record.

1. Verify and integrate all preceding lots, with candidate SHA evidence.
2. Complete functional/visual QA and document limitations; invent no hardware results.
3. Confirm license, identity, remote, URL, and publication authorization.
4. Create a release branch from `dev`; align catalog/registry versions and changelog. Preparation PR to `dev`, then a separate promotion PR `dev -> main` only. No npm publication is required in V1.
5. Fully validate and preview the exact candidate. Fix defects in separate commits and rerun invalidated evidence, plus final validation of the selected SHA.
6. Authorize promotion `dev -> main`, retain candidate ancestry, and deploy the qualified artifact.
7. Verify the public site: deep links, source, workers, fonts, download, registry, and one installation from the public URL.
8. Create an annotated tag and release on `main` only after confirmation; record tag/SHA/URL, checks, and limitations. Close L16 and set Done only after verified delivery. Later documentation updates follow docs/* -> dev -> main, never a direct push.

### L16 handoff checklist

1. The author, MIT license, host, `SITE_URL`, non-indexing mode, and official
   v1.0.0 continuation are confirmed in `docs/implementation/status.json`.
2. The immutable `/r/v1.0.0/` registry and release notes were qualified on
   `release/v1.0.0`; preparation PR #74 merged to `dev`.
3. `protect-main` requires `release-policy`; authorized PR #75 merged exact
   `dev` to `main` without closing L16.
4. The fingerprint-matched prebuilt artifact was isolated-probed, promoted, and
   verified through stable public probes and one public shadcn installation.
5. Create the annotated tag and GitHub Release from the recorded `main` merge,
   verify their immutable URLs, then record the final state and close L16.

## Rollback

Keep the previous deployment's fingerprinted artifact and manifest. To roll back, redeploy that complete artifact, verify its fingerprint, restore its matching current catalog pointer, and rerun the public HTTP probes. Never overwrite `/r/vX.Y.Z/`; an incompatible fix creates a new version. Record the restored artifact SHA, output digest, deployment identifier, smoke result and reason. A first release has no predecessor: withdraw or place the site in maintenance, preserve immutable registry items, and publish a corrected version. L15 only proves restart and verification of a local artifact; it does not claim a production rollback.
