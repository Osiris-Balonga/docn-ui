# ADR 0001 — Static site and separate document sources

Date: 2026-08-28. Status: site/workspace portion implemented and verified in L01; PDF engine/worker portion remains subject to L02 feasibility. shadcn/ui is confirmed by the maintainer. Exact versions and compatibility limitations are in [DEPENDENCIES](../DEPENDENCIES.md).

## Decision

Two pnpm workspaces: `apps/www` and `packages/documents`. Next.js App Router with static export for documentation/catalog; React and strict TypeScript. shadcn/ui with Base UI and Tailwind for the site. Render with `@react-pdf/renderer` in a browser worker and through a Node entry point. Local PDF.js viewer loaded on demand.

## Rationale and alternatives

Next.js provides indexable static pages without a data server. Vite remains valid but would require an explicit documentation prerendering strategy; no migration to Vite without a written decision. No Turborepo at bootstrap: pnpm and simple scripts can orchestrate two workspaces. No global store while hooks/reducers suffice.

Base UI is a consistency choice, not an automatically inherited DrawMotion requirement; Radix would be possible, but do not mix bases. PDF generation is independent of this choice. Using the shadcn name or style does not mean redistributing its visual identity.

## Required validation

L01 records supported versions and actual noninteractive commands. L02 proves worker/font bundling in production export, error recovery, and Node generation. If the worker requires a different bundler or PDF post-processing, update this ADR before catalog lots.

## Consequences

No Server Actions/runtime API, no site dependency in distributed code, no unnecessary packages. Hosting must correctly serve static paths, JSON, workers, and fonts.
