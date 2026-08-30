import { renderToBuffer } from "@react-pdf/renderer";
import { createNodeAssetResolver } from "./assets.node";
import type { AssetResolver } from "./assets";
import {
  renderFixedDocument,
  type DocumentRenderRuntime,
  type FixedDocumentRenderPlan,
} from "./runtime";

export function createNodeDocumentRuntime(
  assetResolver: AssetResolver = createNodeAssetResolver(),
): DocumentRenderRuntime {
  return {
    assetResolver,
    async renderDocument(document) {
      return new Uint8Array(await renderToBuffer(document));
    },
  };
}

export function renderDocumentInNode(
  plan: FixedDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  return renderFixedDocument(plan, createNodeDocumentRuntime(assetResolver));
}
