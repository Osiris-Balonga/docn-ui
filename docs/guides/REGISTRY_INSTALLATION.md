# Development registry installation

The L07 registry is available for local qualification. It is not a published release, and `/r/dev/` can change until a version and public origin are approved.

## Prerequisites

- Node.js 24.x and pnpm 11.24.0 for the qualified development workflow.
- A React 19 TypeScript project initialized with shadcn 4.19.0.
- An existing shadcn `components.json` file. Keep its current style, aliases, base, and registry entries; docn-ui does not require `@/*` or a second initialization. The official CLI resolves generated `~/docn/**` targets below the consumer project root, and those files use relative internal imports.
- A running local docn-ui site. From this repository, `corepack pnpm dev` serves the registry at the origin printed by Next.js.

The registry items declare their exact React-pdf, pdf-lib, Zod, QR, and React dependencies. The shadcn CLI installs the dependencies required by the selected item and its versioned registry dependency closure.

## Install source

Open a template detail page and copy the command shown beside its source. With the default static preview origin, the minimal business card command is:

```sh
corepack pnpm dlx shadcn@4.19.0 add http://127.0.0.1:4173/r/dev/docn-business-card-minimal.json
```

The detail page reads the same generated item JSON used by the CLI. Its source viewer follows all registry dependencies and exposes every installed file, including the asset utility. Review those files before running the command.

The direct URL is the qualified development path. When an approved public HTTPS origin exists, add docn-ui alongside other registries in the same `components.json`:

```json
{
  "registries": {
    "@docn": "https://<approved-origin>/r/v1.0.0/{name}.json"
  }
}
```

Then the official CLI can install `@docn/docn-business-card-minimal`. The placeholder is intentionally not presented as a copy-ready public command before hosting and publication are authorized.

## Prepare local assets

For a browser consumer, install the exact fonts and license below the consumer's own public directory:

```sh
node docn/assets/install.mjs --manifest http://127.0.0.1:4173/r/dev/assets/manifest.json --target browser
```

For a Node consumer, use the Node target and pass the resulting local root to `createNodeAssetResolver`:

```sh
node docn/assets/install.mjs --manifest http://127.0.0.1:4173/r/dev/assets/manifest.json --target node
```

See the [asset installation guide](./REGISTRY_ASSETS.md) for browser and Node code examples, destination rules, hashes, and manual installation.

## Customize and update

The installed files belong to the consumer. Edit the template, primitives, theme tokens, schema, or examples directly. Keep physical-format and safe-frame constraints intact unless the change is qualified with the PDF suite.

Before updating, inspect the current registry item and the proposed difference:

```sh
corepack pnpm dlx shadcn@4.19.0 view http://127.0.0.1:4173/r/dev/docn-business-card-minimal.json
corepack pnpm dlx shadcn@4.19.0 add http://127.0.0.1:4173/r/dev/docn-business-card-minimal.json --dry-run
corepack pnpm dlx shadcn@4.19.0 add http://127.0.0.1:4173/r/dev/docn-business-card-minimal.json --diff
```

Do not add `--overwrite` to the documented workflow. Resolve source and asset differences explicitly. Immutable release URLs will make compatible updates deliberate; an incompatible source contract will use a new major path.
