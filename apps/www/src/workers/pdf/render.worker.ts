/// <reference lib="webworker" />

import { renderFeasibilityFixtureInBrowser } from "@docn-ui/documents/feasibility/browser";
import {
  fingerprintRenderRequest,
  type PhysicalDimensions,
} from "@docn-ui/documents/core";
import {
  parsePdfRenderRequest,
  PDF_RENDER_PROTOCOL_VERSION,
  type PdfRenderFailure,
  type PdfRenderResponse,
  type PdfRenderSuccess,
} from "./protocol";

const workerScope: DedicatedWorkerGlobalScope =
  self as unknown as DedicatedWorkerGlobalScope;

workerScope.addEventListener(
  "message",
  async (event: MessageEvent<unknown>) => {
    const validated = parsePdfRenderRequest(event.data);
    if (!validated || validated.format.kind !== "fixed") {
      const failure: PdfRenderFailure = {
        kind: "failure",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: 0,
        code: "INVALID_DATA",
        message: "The PDF render request is invalid.",
      };
      workerScope.postMessage(failure);
      return;
    }

    const request = validated.request;
    try {
      const bytes = await renderFeasibilityFixtureInBrowser({
        fixture: "card",
        name: request.data.name,
        printProfile: request.printProfile,
        themeId: request.themeId,
      });
      const pdfBytes = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
      const dimensions: PhysicalDimensions = validated.format.trim;
      const success: PdfRenderSuccess = {
        kind: "success",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        result: {
          revision: request.revision,
          pdfBytes,
          pageCount: 2,
          finalDimensions: [dimensions, dimensions],
          diagnostics: [],
          fingerprint: await fingerprintRenderRequest(request),
        },
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
