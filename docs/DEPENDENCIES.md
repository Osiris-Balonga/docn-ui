# Dependency decisions

Resolved on 2026-08-29 from the npm registry. Versions are exact in manifests and the lockfile. Two private workspaces; no package publication is configured.

## Bootstrap (L01-S01)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| Node.js | 24.18.0 | Node.js license | Installed LTS runtime; pinned in .node-version and CI; no browser payload |
| pnpm | 11.24.0 | MIT | Workspace and frozen lockfile; no browser payload |
| Next.js | 16.3.3 | MIT | Static App Router export; framework client runtime only, no deployed Node server |
| React / React DOM | 19.2.8 | MIT | Matching stable pair within Next's peer range; shared UI runtime |
| TypeScript | 5.9.3 | Apache-2.0 | Conservative supported compiler; defer the newer major migration; build only |
| @types/node | 24.13.3 | MIT | Matches the runtime major; types only |
| @types/react / @types/react-dom | 19.2.18 / 19.2.5 | MIT | Matches React 19; types only |
| cross-env | 10.1.0 | MIT | Disable Next telemetry in portable scripts; tooling only |
| http-server | 14.1.1 | MIT | Serve the exported files on loopback with real 404 handling; tooling only |

Node is restricted to the qualified 24.x LTS line. The installed runtime satisfies all declared package engines. `sharp` is the only approved installation build in S01; it is a Next dependency, not a browser dependency. Project license selection remains a maintainer decision; dependency licenses do not license this repository.

Sources: [Next static exports](https://nextjs.org/docs/app/guides/static-exports), [Next installation](https://nextjs.org/docs/app/getting-started/installation), [pnpm settings](https://pnpm.io/settings), and the published npm manifests for the exact versions above.

## Interface (L01-S02)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| shadcn CLI / CSS helpers | 4.19.0 | MIT | Source generation and compile-time Tailwind helpers; dev dependency, no CLI JavaScript in browser |
| @base-ui/react | 1.7.0 | MIT | Button and Tooltip primitives; imported through component subpaths |
| Tailwind CSS / PostCSS plugin | 4.3.3 | MIT | Build-time utility generation; emitted CSS only |
| class-variance-authority | 0.7.1 | Apache-2.0 | Generated Button variants; small client utility |
| clsx | 2.1.1 | MIT | Generated class composition utility |
| tailwind-merge | 3.6.0 | MIT | Generated class conflict resolution; client code |
| lucide-react | 1.34.0 | ISC | One named arrow icon; no icon gallery imported |
| tw-animate-css | 1.4.0 | MIT | Tooltip CSS animations; global reduced-motion override |
| Geist font assets | 1.7.2 | OFL-1.1 | Two local variable WOFF2 files, 141020 bytes total; no runtime package or external font requests |

The CLI help was inspected before initialization; this version accepts `--base base`, not the older `base-ui` flag. Commands used:

```sh
shadcn init --cwd apps/www --defaults --base base --no-monorepo --no-reinstall --yes
shadcn add tooltip --cwd apps/www --yes
```

Both were run with exact `shadcn@4.19.0` and `pnpm@11.24.0`. Init installed Button; only Tooltip was added afterwards. Style `base-nova`, neutral tokens, CSS variables, and aliases are recorded in `components.json`. Generated sources are in `components/ui` and `lib/utils.ts`; the upstream MIT license is retained in `components/ui/LICENSE.txt` (GitHub license blob `fad4d887a681dd49233e5ed01ee2c7a1513089a0`). No force initialization, Radix primitives, or additional UI components.

Init's Google Fonts import and circular `--font-sans` token were replaced by locally bundled, licensed font files with literal family names. [Font provenance and hashes](../apps/www/src/assets/fonts/README.md) are tracked. The fonts belong to the website; PDF font qualification is separate.

## Quality tooling (L01-S03)

All packages below are development dependencies; none is imported by the production application.

| Dependency | Version | License | Purpose |
| --- | --- | --- | --- |
| ESLint | 9.39.5 | MIT | Compatible lint runtime for the current Next plugins; see limitation below |
| eslint-config-next | 16.3.3 | MIT | Framework, accessibility, React, and TypeScript lint rules |
| Prettier | 3.9.6 | MIT | Code/config formatting |
| Vitest / coverage-v8 | 4.1.11 | MIT | Exclusive lightweight projects and optional coverage; same version |
| Vite (transitive, locked) | 8.2.2 | MIT | Vitest transformation; not the production Next bundler |
| jsdom | 30.0.1 | MIT | Component environment only; compatible with Node 24.18 |
| Testing Library React / DOM | 16.3.3 / 10.4.1 | MIT | Composition semantics and rendering |
| Testing Library user-event | 14.6.6 | MIT | Keyboard interaction in jsdom |
| Testing Library jest-dom | 7.0.1 | MIT | DOM assertions |
| unrs-resolver (transitive, locked) | 1.12.2 | MIT | ESLint import resolution; reviewed native-package postinstall explicitly allowed |

**Compatibility limitation:** ESLint 9.39.5 is deprecated upstream. ESLint 10.9.1 was actually tried and rejected: the Next-resolved import/jsx-a11y/react plugins declare ESLint 9 peer ranges, and `react/display-name` crashes on the removed `context.getFilename` API. Pin the functioning compatible version without suppressing rules or peer checks; reconsider at L13 or when Next's plugin dependencies support ESLint 10. This affects developer tooling, not shipped site code. `pnpm peers check` must remain clean.

## PDF feasibility (L02-S01)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| @react-pdf/renderer | 4.9.0 | MIT | Local React document layout and PDF generation; the browser worker imports only this rendering path |
| pdf-lib | 1.17.1 | MIT | Isolated final-byte post-processing for explicit MediaBox, CropBox, TrimBox, and BleedBox entries |
| pdfjs-dist | 6.2.108 | Apache-2.0 | Independent content/dimension reader in qualification and local browser viewer in S02; worker asset remains local |
| React | 19.2.8 | MIT | Matches the website runtime and is required by the renderer |
| Noto Sans Latin static WOFF | @fontsource/noto-sans 5.3.0 | OFL-1.1 | 20,176-byte local PDF font with fixed checksum; no external request |

The raw React-pdf probe emitted only `MediaBox`; `CropBox`, `TrimBox`, and `BleedBox` were absent. That observed gap justifies the narrow `pdf-lib` step. It loads the completed bytes, writes the four page boxes, and enforces the final 20 MiB limit without participating in layout. Font provenance, license text, and checksum are stored beside the asset in `packages/documents/assets/fonts`.

## Document contracts (L04-S01)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| Zod | 3.25.76 | MIT | Strict render-request contracts and field-path validation; imported by the document core and tree-shaken with distributed source |

Zod is a direct dependency because render requests cross the browser-worker boundary and future template schemas must return the same structured field paths. Version 3.25.76 was already locked transitively through development tooling, but that copy was not a production contract. Promoting the established MIT-licensed version avoids a second copy and preserves the workspace's dependency-age policy without an exception; no runtime network request is introduced.
