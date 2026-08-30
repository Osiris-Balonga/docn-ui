import { pdf } from "@react-pdf/renderer";
import { createBrowserAssetResolver } from "./assets.browser";
import type { AssetResolver } from "./assets";
import {
  renderFixedDocument,
  type DocumentRenderRuntime,
  type FixedDocumentRenderPlan,
} from "./runtime";

export { createBrowserAssetResolver } from "./assets.browser";

export function createBrowserDocumentRuntime(
  assetResolver: AssetResolver = createBrowserAssetResolver(),
): DocumentRenderRuntime {
  return {
    assetResolver,
    async renderDocument(document) {
      const blob = await pdf(document).toBlob();
      return new Uint8Array(await blob.arrayBuffer());
    },
  };
}

export function renderDocumentInBrowser(
  plan: FixedDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  return renderFixedDocument(plan, createBrowserDocumentRuntime(assetResolver));
}
