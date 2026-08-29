/// <reference lib="webworker" />

import { renderQualificationInBrowser } from "@docn-ui/documents/browser";
import {
  isPdfRenderRequest,
  PDF_RENDER_PROTOCOL_VERSION,
  type PdfRenderFailure,
  type PdfRenderResponse,
  type PdfRenderSuccess,
} from "./pdf-render.protocol";

const workerScope: DedicatedWorkerGlobalScope =
  self as unknown as DedicatedWorkerGlobalScope;

workerScope.addEventListener(
  "message",
  async (event: MessageEvent<unknown>) => {
    if (!isPdfRenderRequest(event.data)) {
      const failure: PdfRenderFailure = {
        kind: "failure",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: 0,
        code: "INVALID_REQUEST",
        message: "The PDF render request is invalid.",
      };
      workerScope.postMessage(failure);
      return;
    }

    const request = event.data;
    try {
      const bytes = await renderQualificationInBrowser({
        fixture: request.fixture,
        name: request.name,
        printProfile:
          request.printProfile === "print"
            ? { kind: "print", bleedMm: 3, cropMarks: true }
            : { kind: "screen" },
      });
      const pdfBytes = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
      const success: PdfRenderSuccess = {
        kind: "success",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: request.revision,
        pageCount: 2,
        pdfBytes,
      };
      workerScope.postMessage(success satisfies PdfRenderResponse, [pdfBytes]);
    } catch (error) {
      console.error("PDF worker render failed", error);
      const failure: PdfRenderFailure = {
        kind: "failure",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: request.revision,
        code: "RENDER_FAILED",
        message: "The PDF could not be rendered. Try again.",
      };
      workerScope.postMessage(failure satisfies PdfRenderResponse);
    }
  },
);
