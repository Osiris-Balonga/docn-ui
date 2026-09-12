# ADR 0005 — Privacy-minimal hybrid analytics

Status: accepted on 2026-09-04 by explicit maintainer direction.

## Context

The public beta needs enough aggregate evidence to answer whether docn-ui is used, where visitors discover it, which templates and components attract attention, and which visits reach preview, download, or installation intent.

The existing architecture deliberately had no telemetry. The maintainer requested analytics before the official v1 release, while also requiring low operational complexity and accepting that the event data is not highly sensitive. The repository remains public, but privileged analytics access must not be public.

Strict cookieless PostHog events do not retain the request data needed for reliable geography. Vercel Web Analytics is already available on the selected Hobby hosting plan, uses no cookies, exposes country and traffic dimensions, and has a first-party aggregate query API. The two products therefore serve different, complementary purposes.

## Decision

The public application uses two bounded sources. Vercel Web Analytics records anonymous page views for traffic, daily trends, countries, entry pages, and referrer hostnames. `posthog-js` records product actions with a public ingestion-only project token and this fixed configuration:

- PostHog EU ingestion;
- `cookieless_mode: "always"`;
- `person_profiles: "never"`;
- no `identify()` calls;
- no autocapture, session replay, surveys, product tours, conversations, heatmaps, web experiments, feature flags, or external dependency loading;
- manual page and product events only;
- a final `before_send` allowlist that removes URLs, titles, referrers, document data, search terms, free-form errors, and person properties.

PostHog page events use coarse route classes rather than full paths. Product events contain only controlled repository identifiers and enums. PostHog project settings must enable Cookieless server hash mode and discard IP data. PostHog geography is not queried. Country aggregation comes only from Vercel's anonymous Web Analytics dataset.

The public PostHog token is expected to be visible in the browser and grants ingestion only. Vercel's page-view script uses its same-origin framework integration and requires no public credential. No PostHog personal API key or Vercel access token is added to this repository or public deployment.

Privileged query code and the dashboard live in the separate private repository `Osiris-Balonga/docn-ui-analytics`. It uses a server-only PostHog Query Read key and a server-only Vercel access token, and is intended for a Vercel Preview Deployment protected by Vercel Authentication. The Hobby-plan production domain is not used for the dashboard.

The dashboard labels traffic and product-action sections by source. It must not present a regional conversion rate or another metric that joins individual visitors across providers. Vercel Web Analytics collection stops when the Hobby allowance is exhausted rather than creating overage charges, and its reporting window is limited by the active plan. Counts may differ because the providers use separate anonymous identifiers, collection paths, and blocker behavior.

## Approved events

| Event                    | Meaning                                                 | Controlled properties                                                  |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `page_viewed`            | A coarse site area rendered or navigation started       | `page_id`, `page_type`, `source`                                       |
| `content_viewed`         | A controlled template/component preview was opened      | `content_id`, `content_type`, `content_family`, `visibility`, `source` |
| `preview_opened`         | A detailed PDF preview was opened                       | same content properties                                                |
| `download_started`       | A controlled static PDF download was requested          | content properties plus `format=pdf`                                   |
| `install_command_copied` | A registry installation command was copied successfully | `package_id`, `package_family`, `source`                               |

Download completion is not claimed because a static anchor cannot reliably observe it. Cross-session return behavior is not claimed because cookieless mode intentionally has no persistent visitor identifier or client session manager.

## Dependency and policy impact

`posthog-js@1.427.0` is pinned. Its published license expression is Apache-2.0 AND MIT. The installed package is large because it contains optional product modules, so the application dynamically loads the bundled slim/no-external entry. The reviewed build measured a 1,573-byte gzip initial-script delta and a 49,990-byte gzip deferred SDK chunk; detailed evidence is recorded in `docs/qa/ANALYTICS.md`.

The Content Security Policy adds only `https://eu.i.posthog.com` to `connect-src`. It does not add wildcard PostHog script access because the SDK is bundled and external dependency loading is disabled.

## Consequences

- Analytics remains optional: missing or invalid public variables disable it without affecting the product.
- The dashboard can answer aggregate product questions without a database or custom authentication.
- Vercel supplies anonymous country and traffic data; PostHog supplies allowlisted product actions.
- Cross-provider visitor joins and regional conversion metrics are deliberately unavailable.
- Cookieless counts are suitable for directional product analysis, not durable user identity or retention cohorts.
- Browser blockers can reduce counts; no reverse proxy is added in V1.
- This maintainer-directed pre-release change does not authorize the official v1 tag, release, `dev` to `main` merge, or indexing.
