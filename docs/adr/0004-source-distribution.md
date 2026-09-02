# ADR 0004 — shadcn registry, no proprietary CLI

Date: 2026-08-28. Status: accepted and qualified in L07; compatibility clarification 2026-08-30.

## Decision

PDF components/templates are source files copied into the user's existing shadcn project by the official shadcn CLI. docn-ui is an additional registry, not a replacement UI system or a separate project initializer. The consumer's existing `components.json` remains authoritative. The application and registry derive from the same code. The workspace package is not a distributed runtime dependency.

## Consequences

Validate the official registry format, qualify cross-item dependencies, and provide an explicit installation path for binaries. Generated source installs below an isolated root-level `docn` directory and uses relative internal imports. It must not require `@/*`, rewrite the consumer's aliases, replace `components/ui`, or create a second configuration file. Consumer qualification deliberately uses a non-`@` shadcn alias. Consumers retain their changes; updates do not force overwrites.

A JSON URL is sufficient for development. A configured `@docn` registry entry is the intended public ergonomics after a public HTTPS origin is approved; listing that namespace in the official registry directory remains a separate publication action and is not assumed. No domain is needed for local-server trials. Test an actual installation before adding all families.

## Alternative

An npm package would be easier to update but less aligned with source ownership. A dedicated CLI would duplicate resolution, installation, and commands; consider it only after proving a shadcn CLI limitation and agreeing on its cost.
