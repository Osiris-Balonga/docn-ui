# Hybrid analytics evidence

Date: 2026-09-04

Scope: maintainer-directed extension of the pre-release analytics decision on `feat/vercel-web-analytics`. This evidence does not change L16 release authorization or state.

## Contract

- Vercel Web Analytics records anonymous page views and supplies traffic, country, route, and referrer aggregates.
- PostHog retains the existing cookieless allowlist for product actions.
- No Vercel access token is present in the public repository, browser bundle, or public Vercel project.
- The private dashboard does not join visitors across providers or derive regional conversion rates.
- Hobby usage cannot create Web Analytics overage charges; collection pauses when the included allowance is exhausted.

## Verification

- `corepack pnpm@11.24.0 --filter @docn-ui/www typecheck`: passed.
- `corepack pnpm@11.24.0 lint`: passed with zero warnings.
- `corepack pnpm@11.24.0 build`: passed, including 18 template PDFs, 21 preview pages, 62 registry items, 28 component PDFs, three theme PDFs, and the complete static Next.js export.
- The emitted layout chunk containing the analytics adapter is 6,376 raw bytes and 2,715 gzip bytes in total. This is a containing-chunk measurement, not an isolated incremental delta.
- The Vercel project Analytics view was observed enabled on 2026-09-04 and exposes the required Pages, Referrers, and Countries dimensions. No billing upgrade or payment method was requested.
- No deployment, production promotion, official release, or `dev` to `main` merge was performed.
