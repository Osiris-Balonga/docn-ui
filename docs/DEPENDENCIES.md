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
| shadcn CLI / CSS helpers | 4.19.1 | MIT | Source generation and compile-time Tailwind helpers; dev dependency, no CLI JavaScript in browser |
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

L07-S01 reuses this exact development dependency's `shadcn/schema` export to validate the generated catalog and items offline against the official Zod schemas. It does not add a parallel schema package, call the network during generation, or ship CLI code to consumers.

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

## Portable PDF typography (L04-S02)

No JavaScript dependency was added. The PDF asset inventory now contains 70,000 bytes across static Latin WOFF files: Noto Sans 400/700 and Noto Serif 400/700 from the published `@fontsource/noto-sans@5.3.0` and `@fontsource/noto-serif@5.3.0` packages, both OFL-1.1. Noto Sans 400 was already qualified in L02; the three added files total 53,312 bytes. Browser builds copy these local files, while Node rendering resolves verified absolute paths from the same manifest. Rendering never downloads a font or accepts a user-provided URL/path.

The asset manifest records exact byte sizes, SHA-256 hashes, license location, source package, family, style, and weight. The Serif registry tarball stalled; the two exact versioned files retrieved through unpkg matched jsDelivr's package mirror byte-for-byte before being committed. This retrieval path is development provenance only and is not used at runtime.

## Browser journey (L05-S02)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| @playwright/test | 1.61.1 | Apache-2.0 | One real Chromium journey verifies the built static site, browser worker, PDF.js preview, and downloaded PDF; test tooling only |

The same-day 1.62.1 release was not adopted. Version 1.61.1 satisfies Node 24, the Next.js optional peer range, and the existing supply-chain policy without an exception. Playwright runs with one worker and zero retries against a dedicated loopback static server. Its browser binary and artifacts are development/CI resources and are not shipped to users.

The root E2E scope also declares `pdfjs-dist` 6.2.108 as a development dependency so strict pnpm workspace isolation permits independent inspection of downloaded bytes. This is the exact version already used by the document and website workspaces, so the lockfile retains one package instance and no additional browser payload is introduced.

## Vector business-card QR (L05-S03)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| qrcode | 1.5.4 | MIT | Produces a deterministic module matrix rendered as native React-pdf SVG rectangles; used only by templates that declare QR support |
| @types/qrcode | 1.5.6 | MIT | Type declarations for the document workspace; development only |

The primitive renders the matrix itself rather than embedding a generated bitmap or making a network request. It enforces the existing 512-byte payload budget, error-correction level M, a four-module quiet zone, and a minimum module size for the selected card layout. Final-PDF decoding remains a separate visual/QR qualification risk and is not inferred from successful matrix creation.

## Final-PDF QR qualification (L08-S01)

| Dependency | Version | License | Reason and browser impact |
| --- | --- | --- | --- |
| @napi-rs/canvas | 1.0.8 | MIT | Test-only native canvas used by PDF.js to rasterize final PDF bytes in Node; already locked as PDF.js's optional renderer, now declared directly for deterministic strict-workspace imports |
| jsQR | 1.4.0 | Apache-2.0 | Test-only independent decoder applied to the PDF raster; it is not imported by document or website runtime code |

These development dependencies add no browser payload and do not replace the maintained `qrcode` encoder. The test deliberately crosses encoder, React-pdf SVG output, final PDF post-processing, PDF.js rasterization, and an independent decoding implementation. `@napi-rs/canvas` was already present in the lockfile through PDF.js, so the direct declaration adds one small JavaScript package entry and no second native binary family.

## Vector barcodes (L12-S02f)

Qualified before adoption on 2026-08-31 from exact npm tarballs:

| Dependency | Version | License | Reason and impact |
| --- | --- | --- | --- |
| jsbarcode | 3.12.3 | MIT, Johan Lindell | Public object-output API encodes Code 128 / EAN-13 without invoking a DOM or canvas renderer. No runtime dependencies. The full public entry measures 64,160 bytes minified / 11,186 bytes gzip with the already locked Rolldown 1.2.6, browser platform, ESM output. |
| @zxing/library | 0.23.0 | Apache-2.0 | Independent final-PDF raster decoder, root development dependency only. Upstream is maintenance-only; the pinned decoder is a test oracle, not a shipped scanner feature. |
| ts-custom-error | 3.3.1 | MIT | Decoder transitive dependency, no runtime dependencies. Test-only. |
| @zxing/text-encoding | 0.9.0 | Unlicense OR Apache-2.0 | Optional decoder transitive dependency, no runtime dependencies. Apache-2.0 option reviewed; test-only. |

Exact tarball license texts and manifests were inspected; ZXing ships its Apache license without a separate NOTICE file. Dependency license/copyright files remain in installed packages; redistribution must preserve their notices. No upstream source is copied into the project. JsBarcode's bundled DOM renderer definitions are not called: only its documented object encoding output is consumed. Private encoder subpaths were avoided. The broader bwip-js candidate was not adopted because this public entry covers the two requested formats within the measured budget; no comparative bwip-js bundle benchmark is claimed. The decoder tarball is 1,802,262 bytes; none of it enters production bundles.

Barcode has a dedicated import/registry entry, not an export from the legacy primitive barrel. The shared theme-context registry item is extracted early from S02g so Barcode can use PDF tokens without depending on the aggregate primitives. Existing template installations retain the same source closure and do not acquire JsBarcode. Component-sized installation of all other primitives remains S02g. No new installer, configuration replacement, server rendering, or package publication is introduced.

Sources: [JsBarcode object output](https://github.com/lindell/JsBarcode#retrieve-the-barcode-values-so-you-can-render-it-any-way-youd-like), [JsBarcode MIT license](https://github.com/lindell/JsBarcode/blob/master/MIT-LICENSE.txt), [ZXing package](https://www.npmjs.com/package/@zxing/library), [ZXing 0.23.0 license](https://github.com/zxing-js/library/blob/v0.23.0/LICENSE). Final component isolation and actual-PDF decoding evidence is recorded in L12 QA after execution.
