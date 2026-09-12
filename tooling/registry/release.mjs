import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const DEVELOPMENT_REGISTRY_VERSION = "dev";

const stablePackageVersionPattern = /^\d+\.\d+\.\d+$/;
const registryVersionPattern = /^(?:dev|v\d+\.\d+\.\d+)$/;

export function registryVersionForPackage(packageVersion) {
  if (!stablePackageVersionPattern.test(packageVersion))
    throw new Error(
      `Invalid stable package version: ${String(packageVersion)}.`,
    );
  return `v${packageVersion}`;
}

export function assertRegistryOrigin(origin, registryVersion) {
  if (!registryVersionPattern.test(registryVersion))
    throw new Error(`Invalid registry version: ${String(registryVersion)}.`);
  const parsed = new URL(origin);
  const expectedPath = `/r/${registryVersion}/`;
  if (
    parsed.pathname !== expectedPath ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0
  ) {
    throw new Error(
      `Registry origin must end at the exact ${expectedPath} path without a query or fragment.`,
    );
  }
  return parsed.href;
}

export async function readReleaseMetadata(root) {
  const manifests = await Promise.all(
    [
      "package.json",
      "apps/www/package.json",
      "packages/documents/package.json",
    ].map(async (path) => ({
      path,
      value: JSON.parse(await readFile(resolve(root, path), "utf8")),
    })),
  );
  const packageVersion = manifests[0].value.version;
  const mismatched = manifests.filter(
    ({ value }) => value.version !== packageVersion,
  );
  if (mismatched.length > 0)
    throw new Error(
      `Release package versions differ: ${manifests.map(({ path, value }) => `${path}=${String(value.version)}`).join(", ")}.`,
    );
  return {
    packageVersion,
    registryVersion: registryVersionForPackage(packageVersion),
  };
}
