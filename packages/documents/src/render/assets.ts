import type { FontAssetDefinition } from "../assets/manifest";

export interface ResolvedAsset {
  definition: FontAssetDefinition;
  source: string;
}

export interface AssetResolver {
  resolve(assetId: string, path?: readonly (number | string)[]): ResolvedAsset;
}
