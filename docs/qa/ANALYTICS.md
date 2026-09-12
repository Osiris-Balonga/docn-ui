# Privacy-minimal analytics evidence

Date: 2026-09-04

Scope: maintainer-directed pre-release analytics change on `feat/privacy-analytics`. This evidence does not change L16 release authorization or state.

## Implemented behavior

- Analytics remains disabled when either public environment variable is absent or when the host is not exactly `https://eu.i.posthog.com`.
- The browser loads the bundled slim PostHog client asynchronously only after the fixed configuration is accepted.
- PostHog runs in always-cookieless mode with person profiles, identification, persistence-dependent product features, automatic capture, replay, surveys, tours, experiments, flags, performance, heatmaps, and external dependency loading disabled.
- A final transport allowlist accepts only the five documented event names, controlled repository identifiers/enums, the minimum cookieless delivery context, referring domain, and controlled UTM medium.
- Full URLs, paths, titles, user document data, free-form search/error content, person properties, and `$set` payloads are removed before delivery.
- The CSP permits only the PostHog EU ingestion origin under `connect-src`.

## Local verification

| Check | Result |
| --- | --- |
| `corepack pnpm@11.24.0 lint` | Passed after generated `.vercel/**` output was explicitly excluded, consistently with the existing `.gitignore`. |
| `corepack pnpm@11.24.0 -r typecheck` | Passed for `packages/documents` and `apps/www`. |
| `corepack pnpm@11.24.0 exec vitest run --project unit apps/www/src/lib/analytics-events.test.ts tooling/deployment/static-policy.test.ts` | 2 files and 5 tests passed. |
| Registry component test | Verifies that a successful install-command copy emits the controlled `install_command_copied` event; a failed clipboard operation remains untracked. |
| `corepack pnpm@11.24.0 build` | Passed; 48 static routes generated and the build fingerprint recorded. |
| Browser check against `apps/www/out` | Home and templates navigation loaded, a PDF preview opened, and the browser console reported no errors. |

The root `typecheck` wrapper was not used as evidence because its nested unqualified `pnpm` resolves the host's older global 11.19.0 binary. The equivalent pinned recursive command above passed with the repository-required 11.24.0 version.

## Emitted JavaScript impact

The home page's unique initial script payload was compared with the preserved pre-change static Vercel artifact:

| Artifact | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| Pre-change initial scripts | 770,811 | 242,780 |
| Analytics build initial scripts | 774,801 | 244,353 |
| Initial delta | +3,990 | +1,573 |

The PostHog slim client is emitted as a deferred chunk of 155,958 raw bytes / 49,990 gzip bytes for the App Router runtime. It is not requested when analytics configuration is absent or invalid. When enabled, the approximate total analytics cost is therefore 51,563 gzip bytes, with only 1,573 gzip bytes on the initial page path.

## External verification still required

- Create/configure the PostHog EU project, enable Cookieless server hash mode, and confirm the project-level IP discard setting.
- Add only the public project token and fixed EU host to the public Vercel project.
- Add the Query Read key and project identifiers only to the private dashboard's Vercel Preview environment.
- Observe sanitized live events and confirm country enrichment remains available after IP discard; remove geography if it does not.
- Verify the private Preview Deployment is protected by Vercel Authentication before sharing its URL.

No live PostHog credentials were available during local verification. No production deployment, release tag, `dev` to `main` merge, or indexing change was performed.
