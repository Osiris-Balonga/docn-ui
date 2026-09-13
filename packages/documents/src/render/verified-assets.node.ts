import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { Font } from "@react-pdf/renderer";
import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assetManifest, getAssetDefinition } from "../assets/manifest";
import { DocumentValidationError } from "../core/errors";
import type { AssetResolver } from "./assets";

const packagedAssetRoot = fileURLToPath(
  new URL("../../assets/", import.meta.url),
);
const verifiedAssetRoots = new WeakMap<AssetResolver, string>();

interface RegisteredFontSource {
  readonly fontStyle: unknown;
  readonly fontWeight: unknown;
  readonly src: unknown;
}

function assetFailure(assetId: string, message: string): never {
  throw new DocumentValidationError([
    {
      code: "ASSET_REJECTED",
      message,
      path: ["runtimeOptions", "fontAssetDirectory", assetId],
    },
  ]);
}

export async function createVerifiedNodeAssetResolver(
  configuredAssetRoot: string = packagedAssetRoot,
): Promise<AssetResolver> {
  let assetRoot: string;
  try {
    assetRoot = await realpath(resolve(configuredAssetRoot));
    if (!(await stat(assetRoot)).isDirectory()) {
      assetFailure(
        "directory",
        "The configured font asset path is not a directory.",
      );
    }
  } catch (error) {
    if (error instanceof DocumentValidationError) throw error;
    return assetFailure(
      "directory",
      "The configured font asset directory could not be read.",
    );
  }

  const verifiedSources = new Map<string, string>();
  for (const definition of assetManifest.assets) {
    try {
      const source = await realpath(resolve(assetRoot, definition.file));
      const fromRoot = relative(assetRoot, source);
      if (
        !isAbsolute(source) ||
        fromRoot.startsWith("..") ||
        isAbsolute(fromRoot)
      ) {
        assetFailure(
          definition.id,
          "A font asset resolved outside the configured directory.",
        );
      }
      const bytes = await readFile(source);
      if (
        bytes.byteLength !== definition.bytes ||
        createHash("sha256").update(bytes).digest("hex") !== definition.sha256
      ) {
        assetFailure(
          definition.id,
          "A font asset does not match the qualified manifest.",
        );
      }
      verifiedSources.set(
        definition.id,
        `data:font/woff;base64,${Buffer.from(bytes).toString("base64")}`,
      );
    } catch (error) {
      if (error instanceof DocumentValidationError) throw error;
      assetFailure(
        definition.id,
        "A qualified font asset is missing or unreadable.",
      );
    }
  }

  const resolver: AssetResolver = {
    resolve(assetId, path = ["assetId"]) {
      const definition = getAssetDefinition(assetId, path);
      const source = verifiedSources.get(assetId);
      if (!source) assetFailure(assetId, "A font asset was not preflighted.");
      return { definition, source };
    },
  };
  verifiedAssetRoots.set(resolver, assetRoot);
  return resolver;
}

function registeredSourcesFor(
  familyName: string,
  style: string,
  weight: number,
): RegisteredFontSource[] {
  const registered = Font.getRegisteredFonts() as Record<
    string,
    { readonly sources?: readonly RegisteredFontSource[] } | undefined
  >;
  return (
    registered[familyName]?.sources?.filter(
      (source) => source.fontStyle === style && source.fontWeight === weight,
    ) ?? []
  ).slice();
}

function decodeCanonicalFontDataUri(
  source: string,
  assetId: string,
  expectedBytes: number,
): Uint8Array {
  const match = /^data:font\/woff;base64,([A-Za-z0-9+/]*={0,2})$/.exec(source);
  const payload = match?.[1];
  if (
    payload === undefined ||
    payload.length % 4 !== 0 ||
    payload.length > Math.ceil(expectedBytes / 3) * 4
  ) {
    return assetFailure(
      assetId,
      "A registered font data source is not a bounded canonical WOFF data URI.",
    );
  }
  const bytes = Buffer.from(payload, "base64");
  if (bytes.toString("base64") !== payload) {
    return assetFailure(
      assetId,
      "A registered font data source is not canonical base64.",
    );
  }
  return new Uint8Array(bytes);
}

async function readEquivalentRegisteredSource(
  source: unknown,
  assetRoot: string,
  assetId: string,
  expectedBytes: number,
): Promise<Uint8Array> {
  if (typeof source !== "string" || source.length === 0) {
    return assetFailure(
      assetId,
      "A registered font source is not a supported local path or data URI.",
    );
  }
  if (source.startsWith("data:")) {
    return decodeCanonicalFontDataUri(source, assetId, expectedBytes);
  }
  if (!isAbsolute(source) && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(source)) {
    return assetFailure(
      assetId,
      "A registered font source is not a supported local path.",
    );
  }
  try {
    const localSource = await realpath(resolve(source));
    const fromRoot = relative(assetRoot, localSource);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
      return assetFailure(
        assetId,
        "A registered font path resolves outside the configured asset directory.",
      );
    }
    const sourceStat = await stat(localSource);
    if (!sourceStat.isFile() || sourceStat.size !== expectedBytes) {
      return assetFailure(
        assetId,
        "A registered local font does not match the manifest byte length.",
      );
    }
    return new Uint8Array(await readFile(localSource));
  } catch (error) {
    if (error instanceof DocumentValidationError) throw error;
    return assetFailure(assetId, "A registered local font could not be read.");
  }
}

export async function verifyVerifiedNodeFontRegistrationBoundary(
  resolver: AssetResolver,
): Promise<void> {
  const assetRoot = verifiedAssetRoots.get(resolver);
  if (!assetRoot) {
    return assetFailure(
      "resolver",
      "The font registration boundary requires a verified Node asset resolver.",
    );
  }
  for (const asset of assetManifest.assets) {
    const sources = registeredSourcesFor(
      asset.family,
      asset.style,
      asset.weight,
    );
    const snapshots = sources.map((source) => ({ source, src: source.src }));
    const bytes = await Promise.all(
      snapshots.map(({ src }) =>
        readEquivalentRegisteredSource(src, assetRoot, asset.id, asset.bytes),
      ),
    );
    for (const candidate of bytes) {
      if (
        candidate.byteLength !== asset.bytes ||
        createHash("sha256").update(candidate).digest("hex") !== asset.sha256
      ) {
        assetFailure(
          asset.id,
          "A registered font source does not match the qualified manifest.",
        );
      }
    }
    const current = registeredSourcesFor(
      asset.family,
      asset.style,
      asset.weight,
    );
    if (
      current.length !== snapshots.length ||
      current.some(
        (source, index) =>
          source !== snapshots[index]?.source ||
          source.src !== snapshots[index]?.src,
      )
    ) {
      assetFailure(
        asset.id,
        "The font registry changed during facade preflight.",
      );
    }
  }
}
