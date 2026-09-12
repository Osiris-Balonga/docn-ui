import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createNodeAssetResolver } from "./assets.node";
import type { AssetResolver } from "./assets";
import {
  renderContinuousDocument,
  renderFixedDocument,
  type ContinuousDocumentRenderPlan,
  type DocumentRenderRuntime,
  type FixedDocumentRenderPlan,
} from "./runtime";

async function measureContinuousContent(
  bytes: Uint8Array,
  finalMarker: string,
) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    if (document.numPages !== 1)
      return { pageCount: document.numPages, usedHeightPt: Infinity };
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const items = content.items.filter(
      (
        item,
      ): item is typeof item & {
        height: number;
        str: string;
        transform: number[];
      } => "str" in item && "height" in item && "transform" in item,
    );
    if (
      !items
        .map((item) => item.str)
        .join(" ")
        .includes(finalMarker)
    ) {
      throw new Error("The receipt final marker was not rendered.");
    }
    const pageHeight = (page.view[3] ?? 0) - (page.view[1] ?? 0);
    const lowerEdge = Math.min(
      ...items.map((item) => (item.transform[5] ?? 0) - item.height * 0.25),
    );
    return {
      pageCount: document.numPages,
      usedHeightPt: pageHeight - lowerEdge + 12,
    };
  } finally {
    await loadingTask.destroy();
  }
}

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

export function renderContinuousDocumentInNode(
  plan: ContinuousDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  return renderContinuousDocument(
    plan,
    createNodeDocumentRuntime(assetResolver),
    measureContinuousContent,
  );
}
