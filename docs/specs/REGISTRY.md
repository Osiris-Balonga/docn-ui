# Source distribution

## Decision

Reuse the shadcn registry and official CLI inside an already initialized shadcn project. Do not create `docn-cli` or a second project configuration in V1. Generate actual complete commands from the configured registry URL and qualified CLI version, never an assumed domain. During development, a direct JSON link is executable. For a public origin, document an additional `@docn` entry in the consumer's existing `components.json`; official registry-directory inclusion requires separate authorization.

The registry distributes PDF components, not site UI components. Installed templates require no `Button`, DOM, site CSS, or Next dependency.

## Organization

A source manifest references `packages/documents/src`. A generator produces the catalog, per-item JSON files, viewable source, and asset manifest. Use `docn-*` IDs for building blocks to avoid collisions with `text`, `table`, or shadcn primitives.

Template items use `registry:block`; helpers use `registry:lib`/`registry:component` according to the official schema. Each file has a type and an explicit root-relative target below `~/docn`; never replace existing UI components. Internal imports are rewritten only to bounded relative paths inside this source tree. Do not require `@/*`, infer another consumer prefix, or modify the consumer's configured component, UI, lib, hook, or utility aliases.

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

L07-S02 also publishes `/r/dev/assets/manifest.json`, four local WOFF files, and their OFL license. The visible installed script `docn/assets/install.mjs` prepares either `public/generated` for browser use or `assets` for Node use. It is never executed by generation, installation, or a package lifecycle hook. See the [browser and Node asset guide](../guides/REGISTRY_ASSETS.md).

## Consumption evidence

### Component-sized distribution (L12-S02g)

The development registry now contains 62 items, including 28 individual component entries, two opt-in document examples, the current 18 templates and their shared dependencies. `tooling/registry/component-items.mjs` is the component inventory. Exact dependency versions remain pinned to the qualified project versions. Registry `devDependencies` include the existing React/Node/QRCode types where needed for strict consumer TypeScript; no new runtime package is introduced.

`docn-text`, `docn-heading`, `docn-key-value`, `docn-stack`, `docn-row`, `docn-divider`, `docn-section`, `docn-card`, `docn-link`, `docn-list`, `docn-image`, `docn-qr-code`, `docn-page-frame`, `docn-document-frame`, `docn-keep-together`, `docn-page-break`, `docn-page-number`, `docn-page-header`, `docn-page-footer`, `docn-table`, `docn-data-table`, `docn-alert`, `docn-badge`, `docn-form`, `docn-signature`, `docn-watermark`, `docn-graph` and `docn-barcode` install independently. Their `meta.component` identifies the primary implementation. Every dependency closure includes the MIT notice at `docn/LICENSE`; font licenses remain separate installed assets. The private workspace package exports matching subpaths, but installation remains source-based, not an npm package publication.

The legacy `docn-primitives` item preserves its public facade and original target paths through reexports. Every implementation still has exactly one source owner. Small contracts, physical geometry, theme context and local font setup are separate supporting items. A bare `docn-text` installation resolves nine source files, including `docn/LICENSE`, with React, react-pdf and Zod; it does not install the aggregate barrel, templates, Graph, QRCode, Barcode, pdf-lib or pdfjs-dist. Installing a rich component likewise does not imply installing the template rendering pipeline. Legacy templates retain that pipeline.

`docn-fonts` is explicit opt-in font/asset setup; components do not fetch assets during installation. `docn-text-example` and `docn-component-example` include that setup and a compiled document composition. Prepare their assets with the existing visible installer, then register fonts with the browser or Node resolver before calling the react-pdf engine. Site CSS and fonts are not automatically inherited.

`meta.sourcePreview` is a bounded list of item/target pairs for code browsing, validated against the installation closure. The site fetches only those declared items and displays only the listed files. For example, DataTable includes its direct table implementation; transitive Text/theme/core files are not exposed as a repository tree. Template previews retain their template/family boundary. `meta.assetsIncluded` controls whether source-page asset instructions first install `docn-fonts`. The official CLI still resolves the complete installation closure independently of the code preview.

### External verification

Two temporary projects outside the monorepo, without resolution through its node_modules: React/Vite and Node/TypeScript. Install using the real pinned shadcn CLI, not a custom copy operation that could hide a registry defect. Their existing shadcn configuration uses a non-`@` import prefix so an accidental docn-ui alias dependency fails qualification. Test prerequisites, transitive installation, local assets, and final rendering without reinitializing or replacing `components.json`.

Static checks traverse every item. The current two-environment scenario samples distinct graphs: Text plus local fonts in the browser; a DataTable/Graph/Barcode document in Node; then a legacy invoice added to that same Node project. Both consumer projects use strict TypeScript and retain their configuration, CSS and owned source. Do not reinstall the same dependency closure for every component or template. Run these tests when distribution changes and at G3/G5; form unit tests must never invoke the CLI or npm downloads.
