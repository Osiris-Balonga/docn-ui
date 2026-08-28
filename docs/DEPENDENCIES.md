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

Node is restricted to the qualified 24.x LTS line. The installed runtime satisfies all declared package engines. `packages/documents` intentionally has no rendering dependency until L02. `sharp` is the only approved installation build in S01; it is a Next dependency, not a browser dependency. Project license selection remains a maintainer decision; dependency licenses do not license this repository.

Sources: [Next static exports](https://nextjs.org/docs/app/guides/static-exports), [Next installation](https://nextjs.org/docs/app/getting-started/installation), [pnpm settings](https://pnpm.io/settings), and the published npm manifests for the exact versions above.
