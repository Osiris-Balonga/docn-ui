import { pdf } from "@react-pdf/renderer";
import { createBrowserAssetResolver } from "./assets.browser";
import {
  renderFixedDocument,
  type DocumentRenderRuntime,
  type FixedDocumentRenderPlan,
} from "./runtime";

export { createBrowserAssetResolver } from "./assets.browser";

export function createBrowserDocumentRuntime(): DocumentRenderRuntime {
  return {
    assetResolver: createBrowserAssetResolver(),
    async renderDocument(document) {
      const blob = await pdf(document).toBlob();
      return new Uint8Array(await blob.arrayBuffer());
    },
  };
}

export function renderDocumentInBrowser(
  plan: FixedDocumentRenderPlan,
): Promise<Uint8Array> {
  return renderFixedDocument(plan, createBrowserDocumentRuntime());
}
