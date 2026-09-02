import { getAssetDefinition } from "../assets/manifest";
import type { AssetResolver } from "./assets";

function getRuntimeOrigin(): string {
  if (typeof globalThis.location?.origin !== "string") {
    throw new Error("A browser asset resolver requires an explicit origin.");
  }
  return globalThis.location.origin;
}

export function createBrowserAssetResolver(
  origin: string | URL = getRuntimeOrigin(),
): AssetResolver {
  const base = new URL("/", origin);
  if (base.protocol !== "http:" && base.protocol !== "https:") {
    throw new Error("Browser document assets require an HTTP(S) origin.");
  }
  return {
    resolve(assetId, path = ["assetId"]) {
      const definition = getAssetDefinition(assetId, path);
      const source = new URL(definition.publicPath, base);
      if (source.origin !== base.origin) {
        throw new Error(
          "Document assets must remain on the configured origin.",
        );
      }
      return { definition, source: source.href };
    },
  };
}
