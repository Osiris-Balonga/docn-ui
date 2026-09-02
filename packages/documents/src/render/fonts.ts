import { Font } from "@react-pdf/renderer";
import { assetManifest } from "../assets/manifest";
import type { AssetResolver } from "./assets";

const registeredSources = new Set<string>();

export function registerDocumentFonts(resolver: AssetResolver): void {
  for (const asset of assetManifest.assets) {
    const resolved = resolver.resolve(asset.id, ["assetIds", asset.id]);
    if (registeredSources.has(resolved.source)) continue;
    Font.register({
      family: asset.family,
      src: resolved.source,
      fontStyle: asset.style,
      fontWeight: asset.weight,
    });
    registeredSources.add(resolved.source);
  }
  Font.registerHyphenationCallback((word) => [word]);
}
