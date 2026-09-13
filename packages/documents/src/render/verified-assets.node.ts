import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { Font } from "@react-pdf/renderer";
import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assetManifest, getAssetDefinition } from "../assets/manifest";
import { DocumentValidationError } from "../core/errors";
import type { AssetResolver } from "./assets";
import { registerDocumentFonts } from "./fonts";

const packagedAssetRoot = fileURLToPath(
  new URL("../../assets/", import.meta.url),
);
const trustedFacadeSources = new WeakSet<object>();
let facadeRenderTail = Promise.resolve();

interface RegisteredFontSource {
  data: unknown;
  readonly fontStyle: string;
  readonly fontWeight: number;
  loadResultPromise: Promise<void> | null;
  readonly src: string;
}

interface RegisteredFontFamily {
  sources: RegisteredFontSource[];
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

  return {
    resolve(assetId, path = ["assetId"]) {
      const definition = getAssetDefinition(assetId, path);
      const source = verifiedSources.get(assetId);
      if (!source) assetFailure(assetId, "A font asset was not preflighted.");
      return { definition, source };
    },
  };
}

function registeredFonts(): Record<string, RegisteredFontFamily | undefined> {
  return Font.getRegisteredFonts() as Record<
    string,
    RegisteredFontFamily | undefined
  >;
}

function repairTrustedSource(
  source: RegisteredFontSource,
  expectedSource: string,
): boolean {
  if (source.src !== expectedSource || !trustedFacadeSources.has(source)) {
    return false;
  }
  if (source.data === null && source.loadResultPromise !== null) {
    source.loadResultPromise = null;
  }
  return true;
}

function activateVerifiedFontPriority(resolver: AssetResolver): () => void {
  const priorByFamily = new Map<string, RegisteredFontSource[]>();
  const promotedByFamily = new Map<string, RegisteredFontSource[]>();
  for (const familyName of new Set(
    assetManifest.assets.map((asset) => asset.family),
  )) {
    priorByFamily.set(
      familyName,
      registeredFonts()[familyName]?.sources.slice() ?? [],
    );
  }
  registerDocumentFonts(resolver);

  for (const asset of assetManifest.assets) {
    const expectedSource = resolver.resolve(asset.id).source;
    const family = registeredFonts()[asset.family];
    let source = family?.sources.find(
      (candidate) =>
        candidate.fontStyle === asset.style &&
        candidate.fontWeight === asset.weight &&
        repairTrustedSource(candidate, expectedSource),
    );
    if (!source) {
      const prior = priorByFamily.get(asset.family) ?? [];
      source = family?.sources.find(
        (candidate) =>
          !prior.includes(candidate) &&
          candidate.fontStyle === asset.style &&
          candidate.fontWeight === asset.weight &&
          candidate.src === expectedSource,
      );
      if (!source) {
        Font.register({
          family: asset.family,
          fontStyle: asset.style,
          fontWeight: asset.weight,
          src: expectedSource,
        });
        source = registeredFonts()[asset.family]?.sources.at(-1);
      }
      if (!source || source.src !== expectedSource) {
        return assetFailure(
          asset.id,
          "The cache-aware font registrar did not retain the verified facade source.",
        );
      }
      trustedFacadeSources.add(source);
    }
    const promoted = promotedByFamily.get(asset.family) ?? [];
    promoted.push(source);
    promotedByFamily.set(asset.family, promoted);
  }

  for (const [familyName, promoted] of promotedByFamily) {
    const family = registeredFonts()[familyName];
    if (!family) {
      return assetFailure(
        familyName,
        "React PDF discarded a verified facade font family.",
      );
    }
    const remaining = family.sources.filter(
      (source) => !promoted.includes(source),
    );
    family.sources.splice(0, family.sources.length, ...promoted, ...remaining);
  }

  return () => {
    for (const [familyName, prior] of priorByFamily) {
      const family = registeredFonts()[familyName];
      if (!family) continue;
      const additions = family.sources.filter(
        (source) => !prior.includes(source),
      );
      family.sources.splice(0, family.sources.length, ...prior, ...additions);
    }
  };
}

export async function withVerifiedNodeFontPriority<T>(
  resolver: AssetResolver,
  render: () => Promise<T>,
): Promise<T> {
  let release!: () => void;
  const previous = facadeRenderTail;
  facadeRenderTail = new Promise<void>((resolveQueue) => {
    release = resolveQueue;
  });
  await previous;
  let restore: (() => void) | undefined;
  try {
    restore = activateVerifiedFontPriority(resolver);
    return await render();
  } finally {
    restore?.();
    release();
  }
}
