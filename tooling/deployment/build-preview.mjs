import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const bundledCorepack = resolve(
  dirname(process.execPath),
  "node_modules/corepack/dist/corepack.js",
);
const packageManager = existsSync(bundledCorepack)
  ? [process.execPath, bundledCorepack, "pnpm@11.24.0"]
  : [process.execPath, process.env.npm_execpath].filter(Boolean);
if (packageManager.length < 2)
  throw new Error("A pnpm or Corepack executable is required.");

const environment = {
  ...process.env,
  DOCN_ALLOW_INDEXING: "false",
  DOCN_REGISTRY_ORIGIN: "http://127.0.0.1:4173/r/dev/",
  SITE_URL: "http://127.0.0.1:4173",
};
const commands = [
  [process.execPath, [resolve(root, "tooling/templates/generate.mjs")]],
  [process.execPath, [resolve(root, "tooling/registry/generate.mjs")]],
  [
    packageManager[0],
    [...packageManager.slice(1), "--filter", "@docn-ui/www", "build"],
  ],
  [
    process.execPath,
    [resolve(root, "tooling/testing/build-fingerprint.mjs"), "write"],
  ],
];

for (const [command, arguments_] of commands) {
  const result = spawnSync(command, arguments_, {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
