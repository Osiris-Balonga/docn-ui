import { renderToBuffer } from "@react-pdf/renderer";
import { createNodeAssetResolver } from "./assets.node";
import {
  renderFixedDocument,
  type DocumentRenderRuntime,
  type FixedDocumentRenderPlan,
} from "./runtime";

export function createNodeDocumentRuntime(): DocumentRenderRuntime {
  return {
    assetResolver: createNodeAssetResolver(),
    async renderDocument(document) {
      return new Uint8Array(await renderToBuffer(document));
    },
  };
}

export function renderDocumentInNode(
  plan: FixedDocumentRenderPlan,
): Promise<Uint8Array> {
  return renderFixedDocument(plan, createNodeDocumentRuntime());
}
