# Source distribution

## Decision

Reuse the shadcn registry and CLI. Do not create `docn-cli` in V1. Generate actual complete commands from the configured registry URL and qualified CLI version, never an assumed domain. Namespace usage requires user configuration or approved registration; a direct JSON link is sufficient for launch.

The registry distributes PDF components, not site UI components. Installed templates require no `Button`, DOM, site CSS, or Next dependency.

## Organization

A source manifest references `packages/documents/src`. A generator produces the catalog, per-item JSON files, viewable source, and asset manifest. Use `docn-*` IDs for building blocks to avoid collisions with `text`, `table`, or shadcn primitives.

Template items use `registry:block`; helpers use `registry:lib`/`registry:component` according to the official schema. Each file has a type and, where required, an explicit `target`. Target a `docn` subdirectory under consumer project aliases; never replace existing UI components.

Dependencies between items in the same registry use qualified, versioned URLs or a configured namespace; a bare name may target the default shadcn registry. Rewrite internal imports with a tested mechanism (AST or a strictly bounded transformation), not a blind global string replacement.

## Assets and independence

Do not place binary fonts in a JSON code field without a supported convention. Distribute a versioned asset manifest and a small explicit fetch utility, or a packaging mechanism verified in L07. If needed, the utility is part of the visible installed code; no hidden postinstall.

Minimum fetcher contract: HTTPS to the configured origin, bounded sizes, expected SHA-256, allowed relative paths under a known asset directory, rejection of traversal/outbound symlinks, no silent overwrite. Explicitly permit a loopback server in tests. Retrieve licenses alongside assets. Manual file copying must remain possible.

After installation and local asset preparation, rendering no longer depends on the docn-ui site. The browser example serves fonts from its own local `public`; the Node example uses its own path resolver. Retrieval failure must not silently generate a PDF with a fallback font.

## Validation and security

- Validate JSON against a local version of the official schema with controlled updates; no network request needed to validate a PR.
- Resolve the graph: unique IDs, existing dependencies, no cycles, permitted paths, licenses, versions.
- Inspect the transitive file closure: no `@docn/...`, `workspace:*`, `apps/www`, private build aliases, or absolute author-machine references.
- Do not execute registry scripts during generation. A shadcn command installs source code: users can inspect files before installing.
- For local consumer changes, the update procedure shows diffs and never uses `--overwrite` by default.
- An incompatible change produces a documented major version. Never replace content at an already published `/r/v1.0.0/...` path.

## Versions and example paths

Contract paths: `/r/registry.json` for the current catalog and `/r/v1.0.0/<item>.json` for files immutable after release. Local development uses a clearly named development version, not `v1.0.0` before publication. A versioned item's dependencies target the same release.

Documentation domains remain placeholders, not copy-ready commands, until `SITE_URL` is configured. Actually executable local examples use the test server's origin.

### Current development implementation

L07-S01 generates `/r/registry.json`, `/r/dev/registry.json`, and eight item files under `/r/dev/`. The default dependency origin is the executable local URL `http://127.0.0.1:4173/r/dev/`; builds for another controlled origin set `DOCN_REGISTRY_ORIGIN`. Generation validates in memory before writing, removes stale development output, writes items in stable order, and leaves `apps/www/public/r/` ignored as reproducible build output. The release path remains intentionally unavailable until a real version and public origin are approved.

## Consumption evidence

Two temporary projects outside the monorepo, without resolution through its node_modules: React/Vite and Node/TypeScript. Install using the real pinned shadcn CLI, not a custom copy operation that could hide a registry defect. Test init/prerequisites, transitive installation, local assets, and final rendering.

Static checks traverse every item. Expensive installations sample distinct graphs: business card, invoice, sheet. Do not reinstall the same dependency closure fifteen times. Run these tests when distribution changes and at G3/G5; form unit tests must never invoke the CLI or npm downloads.
