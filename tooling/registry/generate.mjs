import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry, registryOutputPaths } from "./registry.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const origin =
  process.env.DOCN_REGISTRY_ORIGIN ?? "http://127.0.0.1:4173/r/dev/";
const checkOnly = process.argv.includes("--check");
const unexpectedArguments = process.argv
  .slice(2)
  .filter((arg) => arg !== "--check");
if (unexpectedArguments.length > 0)
  throw new Error("Use generate.mjs with no arguments or --check.");

const registry = await buildRegistry({ root, origin });
if (checkOnly) {
  console.log(
    `Verified ${registry.items.length} registry items against the pinned official schema.`,
  );
} else {
  const { publicRoot, versionRoot } = registryOutputPaths(root);
  await rm(publicRoot, { recursive: true, force: true });
  await mkdir(versionRoot, { recursive: true });
  const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`;
  await writeFile(
    resolve(publicRoot, "registry.json"),
    serialize(registry.catalog),
  );
  await writeFile(
    resolve(versionRoot, "registry.json"),
    serialize(registry.catalog),
  );
  await Promise.all(
    registry.items.map((item) =>
      writeFile(resolve(versionRoot, `${item.name}.json`), serialize(item)),
    ),
  );
  console.log(
    `Generated ${registry.items.length} development registry items in apps/www/public/r/dev.`,
  );
}
