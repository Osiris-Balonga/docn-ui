import { createHash } from "node:crypto";
import { lstat, mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, posix, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const MAX_ASSET_MANIFEST_BYTES = 64 * 1024;
export const MAX_ASSET_FILE_BYTES = 256 * 1024;
export const MAX_ASSET_TOTAL_BYTES = 1024 * 1024;

function isLoopback(hostname) {
  return (
    hostname === "127.0.0.1" || hostname === "localhost" || hostname === "[::1]"
  );
}

export function parseDistributionUrl(value, label = "Asset URL") {
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    !(url.protocol === "http:" && isLoopback(url.hostname))
  ) {
    throw new Error(`${label} must use HTTPS, except on loopback.`);
  }
  return url;
}

export function assertSafeAssetPath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    posix.isAbsolute(value) ||
    posix.normalize(value) !== value ||
    value.startsWith("../")
  ) {
    throw new Error(`Unsafe asset path: ${String(value)}`);
  }
  return value;
}

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function validateDistributionManifest(manifest, manifestUrl) {
  if (
    !manifest ||
    manifest.schemaVersion !== 1 ||
    typeof manifest.registryVersion !== "string" ||
    !Array.isArray(manifest.files) ||
    manifest.files.length === 0
  ) {
    throw new Error("Invalid docn asset manifest.");
  }
  const baseUrl = parseDistributionUrl(manifestUrl, "Asset manifest URL");
  const paths = new Set();
  let totalBytes = 0;
  const files = manifest.files.map((file) => {
    const path = assertSafeAssetPath(file.path);
    if (paths.has(path)) throw new Error(`Duplicate asset path: ${path}`);
    paths.add(path);
    if (
      !Number.isInteger(file.bytes) ||
      file.bytes <= 0 ||
      file.bytes > MAX_ASSET_FILE_BYTES
    ) {
      throw new Error(`Invalid or excessive asset size for ${path}.`);
    }
    totalBytes += file.bytes;
    if (totalBytes > MAX_ASSET_TOTAL_BYTES) {
      throw new Error("The asset manifest exceeds the total size limit.");
    }
    if (!isSha256(file.sha256)) throw new Error(`Invalid SHA-256 for ${path}.`);
    if (file.kind !== "font" && file.kind !== "license") {
      throw new Error(`Unsupported asset kind for ${path}.`);
    }
    const url = parseDistributionUrl(file.url);
    if (url.origin !== baseUrl.origin) {
      throw new Error(`Asset ${path} must use the manifest origin.`);
    }
    return { ...file, path, url: url.href };
  });
  return { ...manifest, files };
}

async function readBoundedResponse(response, maximumBytes, label) {
  if (!response.ok)
    throw new Error(`${label} returned HTTP ${response.status}.`);
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new Error(`${label} exceeds the size limit.`);
  }
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maximumBytes)
      throw new Error(`${label} exceeds the size limit.`);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maximumBytes) {
      await reader.cancel();
      throw new Error(`${label} exceeds the size limit.`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function getPathState(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  }
}

async function prepareDestination(outputDirectory, filePaths) {
  const root = resolve(outputDirectory);
  const rootState = await getPathState(root);
  if (rootState?.isSymbolicLink())
    throw new Error("The asset output root cannot be a symlink.");
  await mkdir(root, { recursive: true });
  for (const filePath of filePaths) {
    const target = resolve(root, ...assertSafeAssetPath(filePath).split("/"));
    const fromRoot = relative(root, target);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
      throw new Error(
        `Asset destination escaped the output root: ${filePath}.`,
      );
    }
    const parentParts = dirname(filePath)
      .split("/")
      .filter((part) => part !== ".");
    let parent = root;
    for (const part of parentParts) {
      parent = resolve(parent, part);
      const state = await getPathState(parent);
      if (state?.isSymbolicLink())
        throw new Error(`Asset destination contains a symlink: ${filePath}.`);
      if (state && !state.isDirectory())
        throw new Error(
          `Asset destination parent is not a directory: ${filePath}.`,
        );
      if (!state) await mkdir(parent);
    }
    if (await getPathState(target))
      throw new Error(`Refusing to overwrite existing asset: ${filePath}.`);
  }
  return root;
}

export async function installAssetFiles({
  manifestUrl,
  outputDirectory,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof fetchImpl !== "function")
    throw new Error("A fetch implementation is required.");
  const parsedManifestUrl = parseDistributionUrl(
    manifestUrl,
    "Asset manifest URL",
  );
  const manifestResponse = await fetchImpl(parsedManifestUrl);
  if (manifestResponse.url) {
    const responseUrl = parseDistributionUrl(
      manifestResponse.url,
      "Asset manifest response URL",
    );
    if (responseUrl.origin !== parsedManifestUrl.origin) {
      throw new Error("The asset manifest redirected to another origin.");
    }
  }
  const manifestBytes = await readBoundedResponse(
    manifestResponse,
    MAX_ASSET_MANIFEST_BYTES,
    "Asset manifest",
  );
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(manifestBytes));
  } catch {
    throw new Error("The asset manifest is not valid JSON.");
  }
  const manifest = validateDistributionManifest(parsed, parsedManifestUrl);
  const downloads = [];
  for (const file of manifest.files) {
    const response = await fetchImpl(file.url);
    if (response.url) {
      const responseUrl = parseDistributionUrl(
        response.url,
        `Asset response URL for ${file.path}`,
      );
      if (responseUrl.origin !== parsedManifestUrl.origin) {
        throw new Error(`Asset ${file.path} redirected to another origin.`);
      }
    }
    const bytes = await readBoundedResponse(
      response,
      file.bytes,
      `Asset ${file.path}`,
    );
    if (bytes.byteLength !== file.bytes)
      throw new Error(`Asset size mismatch for ${file.path}.`);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== file.sha256)
      throw new Error(`Asset checksum mismatch for ${file.path}.`);
    downloads.push({ file, bytes });
  }
  const root = await prepareDestination(
    outputDirectory,
    downloads.map(({ file }) => file.path),
  );
  for (const { file, bytes } of downloads) {
    await writeFile(resolve(root, ...file.path.split("/")), bytes, {
      flag: "wx",
    });
  }
  return {
    files: downloads.map(({ file }) => file.path),
    outputDirectory: root,
  };
}

function usage() {
  return "Usage: node install.mjs --manifest <url> --target <browser|node> [--output <directory>]";
}

function parseArguments(arguments_) {
  const values = new Map();
  for (let index = 0; index < arguments_.length; index += 2) {
    const flag = arguments_[index];
    const value = arguments_[index + 1];
    if (!flag?.startsWith("--") || value === undefined)
      throw new Error(usage());
    values.set(flag, value);
  }
  const target = values.get("--target");
  if (target !== "browser" && target !== "node") throw new Error(usage());
  const manifestUrl = values.get("--manifest");
  if (!manifestUrl) throw new Error(usage());
  const outputDirectory =
    values.get("--output") ??
    (target === "browser" ? "public/generated" : "assets");
  const absoluteOutput = resolve(process.cwd(), outputDirectory);
  const fromCwd = relative(process.cwd(), absoluteOutput);
  if (fromCwd.startsWith("..") || isAbsolute(fromCwd)) {
    throw new Error(
      "The asset output directory must remain inside the current project.",
    );
  }
  return { manifestUrl, outputDirectory: absoluteOutput };
}

async function main() {
  const result = await installAssetFiles(parseArguments(process.argv.slice(2)));
  console.log(
    `Installed ${result.files.length} verified files in ${result.outputDirectory}.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
