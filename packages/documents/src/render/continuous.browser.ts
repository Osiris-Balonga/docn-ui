import { getDocument, PDFWorker } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { ContinuousDocumentRenderPlan } from "./runtime";
import { renderContinuousDocument } from "./runtime";
import type { AssetResolver } from "./assets";
import { createBrowserDocumentRuntime } from "./browser";
import { assertQualifiedContinuousFinalMarker } from "./continuous-plan";
import { inspectContinuousTextContent } from "./continuous-measurement";

async function measureContinuousContentInBrowser(
  bytes: Uint8Array,
  finalMarker: string,
) {
  const worker = new Worker(
    new URL("./pdfjs.worker.browser.ts", import.meta.url),
    { name: "docn-pdf-measurement", type: "module" },
  );
  let pdfWorker: PDFWorker | undefined;
  let loadingTask: ReturnType<typeof getDocument> | undefined;
  try {
    pdfWorker = PDFWorker.create({
      name: "docn-pdf-measurement",
      port: worker,
    });
    loadingTask = getDocument({
      data: bytes.slice(),
      useSystemFonts: false,
      worker: pdfWorker,
    });
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
    try {
      await loadingTask?.destroy();
    } finally {
      try {
        pdfWorker?.destroy();
      } finally {
        worker.terminate();
      }
    }
  }
}

export function renderContinuousDocumentInBrowser(
  plan: ContinuousDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  assertQualifiedContinuousFinalMarker(plan.finalMarker);
  return renderContinuousDocument(
    plan,
    createBrowserDocumentRuntime(assetResolver),
    measureContinuousContentInBrowser,
  );
}
