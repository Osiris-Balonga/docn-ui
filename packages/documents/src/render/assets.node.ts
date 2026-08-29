import { isAbsolute, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getAssetDefinition } from "../assets/manifest";
import type { AssetResolver } from "./assets";

const assetRoot = fileURLToPath(new URL("../../assets/", import.meta.url));

export function createNodeAssetResolver(): AssetResolver {
  return {
    resolve(assetId, path = ["assetId"]) {
      const definition = getAssetDefinition(assetId, path);
      const source = fileURLToPath(
        new URL(`../../assets/${definition.file}`, import.meta.url),
      );
      const fromRoot = relative(assetRoot, source);
      if (
        !isAbsolute(source) ||
        fromRoot.startsWith("..") ||
        isAbsolute(fromRoot)
      ) {
        throw new Error(
          "The document asset manifest resolved outside its package root.",
        );
      }
      return { definition, source };
    },
  };
}
