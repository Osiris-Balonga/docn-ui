import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import {
  MAX_ASSET_FILE_BYTES,
  MAX_ASSET_TOTAL_BYTES,
  assertSafeAssetPath,
  parseDistributionUrl,
  validateDistributionManifest,
} from "../../packages/documents/src/assets/install.mjs";

function validateSourceManifest(manifest) {
  if (
    !manifest ||
    manifest.schemaVersion !== 1 ||
    !Array.isArray(manifest.assets) ||
    !Array.isArray(manifest.licenses) ||
    manifest.assets.length === 0 ||
    manifest.licenses.length === 0
  ) {
    throw new Error("Invalid source asset manifest.");
  }
  const entries = [
    ...manifest.assets.map((asset) => ({
      bytes: asset.bytes,
      file: asset.file,
      kind: "font",
      license: asset.license,
      sha256: asset.sha256,
    })),
    ...manifest.licenses.map((license) => ({
      bytes: license.bytes,
      file: license.file,
      kind: "license",
      license: license.license,
      sha256: license.sha256,
    })),
  ];
  const paths = new Set();
  const licensePaths = new Set(
    manifest.licenses.map((license) => license.file),
  );
  let totalBytes = 0;
  for (const entry of entries) {
    assertSafeAssetPath(entry.file);
    if (paths.has(entry.file))
      throw new Error(`Duplicate source asset path: ${entry.file}.`);
    paths.add(entry.file);
    if (
      !Number.isInteger(entry.bytes) ||
      entry.bytes <= 0 ||
      entry.bytes > MAX_ASSET_FILE_BYTES
    ) {
      throw new Error(
        `Invalid or excessive source asset size for ${entry.file}.`,
      );
    }
    totalBytes += entry.bytes;
    if (totalBytes > MAX_ASSET_TOTAL_BYTES)
      throw new Error("Source assets exceed the total size limit.");
    if (!/^[a-f0-9]{64}$/.test(entry.sha256))
      throw new Error(`Invalid source asset SHA-256 for ${entry.file}.`);
  }
  for (const asset of manifest.assets) {
    if (!licensePaths.has(asset.licenseFile))
      throw new Error(`Missing license file for ${asset.file}.`);
  }
  return entries;
}

export async function readVerifiedAssetFiles(root, manifestOverride) {
  const assetRoot = resolve(root, "packages/documents/assets");
  const manifest =
    manifestOverride ??
    JSON.parse(await readFile(resolve(assetRoot, "manifest.json"), "utf8"));
  const entries = validateSourceManifest(manifest);
  const files = [];
  for (const entry of entries) {
    const absolute = resolve(assetRoot, ...entry.file.split("/"));
    const fromRoot = relative(assetRoot, absolute);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
      throw new Error(`Source asset escaped its root: ${entry.file}.`);
    }
    let state;
    try {
      state = await lstat(absolute);
    } catch {
      throw new Error(`Missing source asset: ${entry.file}.`);
    }
    if (!state.isFile() || state.isSymbolicLink())
      throw new Error(`Source asset must be a regular file: ${entry.file}.`);
    const bytes = new Uint8Array(await readFile(absolute));
    if (bytes.byteLength !== entry.bytes)
      throw new Error(`Source asset size mismatch for ${entry.file}.`);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== entry.sha256)
      throw new Error(`Source asset checksum mismatch for ${entry.file}.`);
    files.push({ ...entry, bytes });
  }
  return { files, manifest };
}

export async function buildDistributionAssets({ root, origin }) {
  const base = parseDistributionUrl(origin, "Registry origin");
  const { files } = await readVerifiedAssetFiles(root);
  const manifestUrl = new URL("assets/manifest.json", base).href;
  const manifest = validateDistributionManifest(
    {
      schemaVersion: 1,
      registryVersion: "dev",
      files: files.map(({ bytes, file, ...entry }) => ({
        ...entry,
        bytes: bytes.byteLength,
        path: file,
        url: new URL(`assets/${file}`, base).href,
      })),
    },
    manifestUrl,
  );
  return { files, manifest, manifestUrl };
}
