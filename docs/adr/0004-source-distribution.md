# ADR 0004 — shadcn registry, no proprietary CLI

Date: 2026-08-28. Status: proposed choice; evidence required in L07.

## Decision

PDF components/templates are source files copied into the user's project by the shadcn CLI. The application and registry derive from the same code. The workspace package is not a distributed runtime dependency.

## Consequences

Validate the official registry format, qualify cross-item dependencies, and provide an explicit installation path for binaries. Consumers retain their changes; updates do not force overwrites.

A JSON URL is sufficient; ownership of an official namespace or `docn-ui` npm package is not assumed. No domain is needed for local-server trials. Test an actual installation before adding all families.

## Alternative

An npm package would be easier to update but less aligned with source ownership. A dedicated CLI would duplicate resolution, installation, and commands; consider it only after proving a shadcn CLI limitation and agreeing on its cost.
