import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { AssetResolver } from "./assets";
import { createNodeDocumentRuntime } from "./node";
import {
  renderContinuousDocument,
  type ContinuousDocumentRenderPlan,
} from "./runtime";
import { assertQualifiedContinuousFinalMarker } from "./continuous-plan";
import { inspectContinuousTextContent } from "./continuous-measurement";

async function measureContinuousContentForFacade(
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
      return inspectContinuousTextContent(
        document.numPages,
        0,
        [],
        finalMarker,
      );
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
    const pageHeight = (page.view[3] ?? 0) - (page.view[1] ?? 0);
    return inspectContinuousTextContent(
      document.numPages,
      pageHeight,
      items,
      finalMarker,
    );
  } finally {
    await loadingTask.destroy();
  }
}

export function renderContinuousDocumentInNodeFacade(
  plan: ContinuousDocumentRenderPlan,
  assetResolver: AssetResolver,
): Promise<Uint8Array> {
  assertQualifiedContinuousFinalMarker(plan.finalMarker);
  return renderContinuousDocument(
    plan,
    createNodeDocumentRuntime(assetResolver),
    measureContinuousContentForFacade,
  );
}
