import { getDocument, PDFWorker } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { ContinuousDocumentRenderPlan } from "./runtime";
import { renderContinuousDocument } from "./runtime";
import type { AssetResolver } from "./assets";
import { createBrowserDocumentRuntime } from "./browser";
import { assertQualifiedContinuousFinalMarker } from "./continuous-plan";
import {
  inspectContinuousTextContent,
  qualifyFinalContinuousPdf,
  type ContinuousPdfInspection,
} from "./continuous-measurement";

function createWorkerFailureSignal(worker: Worker) {
  let rejectFailure!: (error: Error) => void;
  const promise = new Promise<never>((_resolve, reject) => {
    rejectFailure = reject;
  });
  void promise.catch(() => undefined);
  const reject = () => {
    rejectFailure(new Error("The PDF measurement worker failed."));
  };
  worker.addEventListener("error", reject);
  worker.addEventListener("messageerror", reject);
  return {
    dispose() {
      worker.removeEventListener("error", reject);
      worker.removeEventListener("messageerror", reject);
    },
    promise,
  };
}

async function inspectContinuousPdfInBrowser(
  bytes: Uint8Array,
): Promise<ContinuousPdfInspection> {
  const worker = new Worker(
    new URL("./pdfjs.worker.browser.ts", import.meta.url),
    { name: "docn-pdf-measurement", type: "module" },
  );
  const workerFailure = createWorkerFailureSignal(worker);
  const raceWorkerFailure = <T>(operation: Promise<T>) =>
    Promise.race([operation, workerFailure.promise]);
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
    const document = await raceWorkerFailure(loadingTask.promise);
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
    const page = await raceWorkerFailure(document.getPage(1));
    const content = await raceWorkerFailure(page.getTextContent());
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
    try {
      try {
        void loadingTask?.destroy().catch(() => undefined);
      } catch {
        // Loading-task cleanup never replaces the render outcome.
      }
      try {
        pdfWorker?.destroy();
      } finally {
        worker.terminate();
      }
    } finally {
      workerFailure.dispose();
    }
  }
}

export async function measureContinuousContentInBrowser(
  bytes: Uint8Array,
  finalMarker: string,
) {
  const inspection = await inspectContinuousPdfInBrowser(bytes);
  return inspectContinuousTextContent(
    inspection.pageCount,
    inspection.pageHeight,
    inspection.items,
    finalMarker,
  );
}

export async function renderContinuousDocumentInBrowser(
  plan: ContinuousDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  assertQualifiedContinuousFinalMarker(plan.finalMarker);
  const bytes = await renderContinuousDocument(
    plan,
    createBrowserDocumentRuntime(assetResolver),
    measureContinuousContentInBrowser,
  );
  qualifyFinalContinuousPdf(
    await inspectContinuousPdfInBrowser(bytes),
    plan.format,
    plan.finalMarker,
  );
  return bytes;
}
