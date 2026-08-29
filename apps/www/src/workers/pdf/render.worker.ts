/// <reference lib="webworker" />

import {
  DocumentValidationError,
  fingerprintRenderRequest,
  type PhysicalDimensions,
} from "@docn-ui/documents/core";
import { renderDocumentInBrowser } from "@docn-ui/documents/browser";
import type { RenderRequest } from "@docn-ui/documents/core";
import type { FixedDocumentRenderPlan } from "@docn-ui/documents";
import type { BusinessCardData } from "@docn-ui/documents/templates/business-cards/schema";
import {
  parsePdfRenderRequest,
  PDF_RENDER_PROTOCOL_VERSION,
  type PdfRenderFailure,
  type PdfRenderResponse,
  type PdfRenderSuccess,
} from "./protocol";

const workerScope: DedicatedWorkerGlobalScope =
  self as unknown as DedicatedWorkerGlobalScope;

async function createPlan(
  request: RenderRequest<BusinessCardData>,
): Promise<FixedDocumentRenderPlan> {
  switch (request.templateId) {
    case "business-card-editorial": {
      const { createBusinessCardEditorialPlan } =
        await import("@docn-ui/documents/templates/business-cards/editorial");
      return createBusinessCardEditorialPlan(request).plan;
    }
    case "business-card-studio": {
      const { createBusinessCardStudioPlan } =
        await import("@docn-ui/documents/templates/business-cards/studio");
      return createBusinessCardStudioPlan(request).plan;
    }
    case "business-card-minimal": {
      const { createBusinessCardMinimalPlan } =
        await import("@docn-ui/documents/templates/business-cards/minimal");
      return createBusinessCardMinimalPlan(request).plan;
    }
    default:
      throw new DocumentValidationError([
        {
          code: "INVALID_DATA",
          message: "The selected PDF template is not available.",
          path: ["templateId"],
        },
      ]);
  }
}

function readRequestedRevision(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  const request = (value as { request?: unknown }).request;
  if (!request || typeof request !== "object") return 0;
  const revision = (request as { revision?: unknown }).revision;
  return Number.isSafeInteger(revision) && Number(revision) > 0
    ? Number(revision)
    : 0;
}

workerScope.addEventListener(
  "message",
  async (event: MessageEvent<unknown>) => {
    const validated = parsePdfRenderRequest(event.data);
    if (!validated || validated.format.kind !== "fixed") {
      const failure: PdfRenderFailure = {
        kind: "failure",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: readRequestedRevision(event.data),
        code: "INVALID_DATA",
        message: "The PDF render request is invalid.",
      };
      workerScope.postMessage(failure);
      return;
    }

    const request = validated.request;
    try {
      const plan = await createPlan(request);
      const bytes = await renderDocumentInBrowser(plan);
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
      const knownError = error instanceof DocumentValidationError;
      const failure: PdfRenderFailure = {
        kind: "failure",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: request.revision,
        code: knownError ? error.code : "RENDER_FAILED",
        message: knownError
          ? error.message
          : "The PDF could not be rendered. Try again.",
      };
      workerScope.postMessage(failure satisfies PdfRenderResponse);
    }
  },
);
