# Registry asset installation

PDF fonts are binary assets and are not embedded into registry JSON. The `docn-render` item installs a visible Node script at `docn/assets/install.mjs`. Run it explicitly after reviewing the installed source. It does not use a postinstall hook and never overwrites an existing file.

The development commands below assume the registry is served by `corepack pnpm dev` at `http://127.0.0.1:4173`. Published documentation must replace this loopback URL only after an immutable release origin is approved.

## Browser project

Install the fonts and OFL license under the consumer's own `public/generated` directory:

```sh
node docn/assets/install.mjs --manifest http://127.0.0.1:4173/r/dev/assets/manifest.json --target browser
```

The manifest paths then match the installed document manifest's `/generated/fonts/*` URLs. The snippets below assume the calling file is directly under `src/`; adjust only the relative first hop when using another location. Create the resolver from the consumer application's origin and pass it to the browser runtime:

```ts
import { createBrowserAssetResolver } from "../docn/render/assets.browser";
import { renderDocumentInBrowser } from "../docn/render/browser";

const assetResolver = createBrowserAssetResolver(window.location.origin);
const pdfBytes = await renderDocumentInBrowser(plan, assetResolver);
```

The browser fetches fonts from the consumer origin. It does not contact the registry after preparation.

## Node project

Install the same verified files into a local `assets` directory:

```sh
node docn/assets/install.mjs --manifest http://127.0.0.1:4173/r/dev/assets/manifest.json --target node
```

Pass that directory explicitly to the Node resolver:

```ts
import { resolve } from "node:path";
import { createNodeAssetResolver } from "../docn/render/assets.node";
import { renderDocumentInNode } from "../docn/render/node";

const assetResolver = createNodeAssetResolver(resolve(process.cwd(), "assets"));
const pdfBytes = await renderDocumentInNode(plan, assetResolver);
```

## Controls and manual installation

The installer accepts HTTPS and loopback HTTP manifests, keeps every file on the manifest origin, limits individual and total downloads, rejects traversal and symlink destinations, verifies declared byte counts and SHA-256 hashes, and writes with exclusive creation. If any destination already exists, inspect the difference and remove or relocate it yourself before retrying; there is no overwrite flag.

Manual installation remains supported: open the versioned asset manifest, download each listed URL, preserve each relative `path` below `public/generated` or `assets`, and compare the exact `bytes` and `sha256` values before rendering. Copy the listed license file alongside the fonts.
