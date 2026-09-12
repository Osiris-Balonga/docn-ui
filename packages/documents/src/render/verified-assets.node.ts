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

export function assertVerifiedNodeFontRegistrationBoundary(
  resolver: AssetResolver,
): void {
  const registered = Font.getRegisteredFonts();
  for (const asset of assetManifest.assets) {
    const expectedSource = resolver.resolve(asset.id).source;
    const family = registered[asset.family];
    const conflicts =
      family?.sources.filter(
        (source) =>
          source.fontStyle === asset.style &&
          source.fontWeight === asset.weight &&
          source.src !== expectedSource,
      ) ?? [];
    if (conflicts.length > 0) {
      assetFailure(
        asset.id,
        "A conflicting font source was registered before the verified facade render.",
      );
    }
  }
}
