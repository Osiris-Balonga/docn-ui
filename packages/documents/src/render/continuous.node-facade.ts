import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { AssetResolver } from "./assets";
import { createNodeDocumentRuntime } from "./node";
import {
  renderContinuousDocument,
  type ContinuousDocumentRenderPlan,
} from "./runtime";
import { assertQualifiedContinuousFinalMarker } from "./continuous-plan";
import {
  inspectContinuousTextContent,
  qualifyFinalContinuousPdf,
  type ContinuousPdfInspection,
} from "./continuous-measurement";

async function inspectContinuousPdfInNode(
  bytes: Uint8Array,
): Promise<ContinuousPdfInspection> {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    if (document.numPages !== 1)
      return {
        items: [],
        pageCount: document.numPages,
        pageHeight: 0,
        pageWidth: 0,
        pageXMax: 0,
        pageXMin: 0,
        pageYMax: 0,
        pageYMin: 0,
      };
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const items = content.items.filter(
      (
        item,
      ): item is typeof item & {
        height: number;
        str: string;
        transform: number[];
        width: number;
      } =>
        "str" in item &&
        "height" in item &&
        "transform" in item &&
        "width" in item,
    );
    return {
      items,
      pageCount: document.numPages,
      pageHeight: (page.view[3] ?? 0) - (page.view[1] ?? 0),
      pageWidth: (page.view[2] ?? 0) - (page.view[0] ?? 0),
      pageXMax: page.view[2] ?? 0,
      pageXMin: page.view[0] ?? 0,
      pageYMax: page.view[3] ?? 0,
      pageYMin: page.view[1] ?? 0,
    };
  } finally {
    await loadingTask.destroy();
  }
}

async function measureContinuousContentForFacade(
  bytes: Uint8Array,
  finalMarker: string,
) {
  const inspection = await inspectContinuousPdfInNode(bytes);
  return inspectContinuousTextContent(
    inspection.pageCount,
    inspection.pageHeight,
    inspection.items,
    finalMarker,
  );
}

export async function renderContinuousDocumentInNodeFacade(
  plan: ContinuousDocumentRenderPlan,
  assetResolver: AssetResolver,
): Promise<Uint8Array> {
  assertQualifiedContinuousFinalMarker(plan.finalMarker);
  const bytes = await renderContinuousDocument(
    plan,
    createNodeDocumentRuntime(assetResolver),
    measureContinuousContentForFacade,
  );
  qualifyFinalContinuousPdf(
    await inspectContinuousPdfInNode(bytes),
    plan.format,
    plan.finalMarker,
  );
  return bytes;
}
