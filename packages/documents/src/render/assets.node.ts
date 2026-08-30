import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getAssetDefinition } from "../assets/manifest";
import type { AssetResolver } from "./assets";

const packagedAssetRoot = fileURLToPath(
  new URL("../../assets/", import.meta.url),
);

export function createNodeAssetResolver(
  configuredAssetRoot: string = packagedAssetRoot,
): AssetResolver {
  const assetRoot = resolve(configuredAssetRoot);
  return {
    resolve(assetId, path = ["assetId"]) {
      const definition = getAssetDefinition(assetId, path);
      const source = resolve(assetRoot, definition.file);
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
