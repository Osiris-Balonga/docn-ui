import {
  DocumentValidationError,
  PDF_RENDER_PROTOCOL_VERSION,
  validateRenderRequest,
  type DocumentErrorCode,
  type RenderRequest,
  type RenderResult,
  type ValidatedRenderRequest,
} from "@docn-ui/documents/core";

export { PDF_RENDER_PROTOCOL_VERSION } from "@docn-ui/documents/core";

export interface QualificationCardData {
  name: string;
}

export interface PdfRenderRequest {
  kind: "render";
  request: RenderRequest<QualificationCardData>;
}

export type SerializedRenderResult = Omit<RenderResult, "pdfBytes"> & {
  pdfBytes: ArrayBuffer;
};

export interface PdfRenderSuccess {
  kind: "success";
  protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION;
  result: SerializedRenderResult;
}

export interface PdfRenderFailure {
  code: DocumentErrorCode | "WORKER_FAILURE";
  kind: "failure";
  message: string;
  protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION;
  revision: number;
}

export type PdfRenderResponse = PdfRenderFailure | PdfRenderSuccess;

const compatibility = {
  supportedFormatIds: ["card-85x55"] as const,
  supportedThemeIds: ["neutral", "editorial", "bold"] as const,
};

export function makePdfRenderRequest(
  revision: number,
  name: string,
): PdfRenderRequest {
  return {
    kind: "render",
    request: {
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
      revision,
      templateId: "qualification-card",
      templateVersion: "1.0.0",
      data: { name },
      formatId: "card-85x55",
      themeId: "neutral",
      locale: "fr",
      printProfile: { kind: "screen" },
      assetIds: [],
    },
  };
}

export function parsePdfRenderRequest(
  value: unknown,
): ValidatedRenderRequest<QualificationCardData> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const wrapper = value as Partial<PdfRenderRequest>;
  if (wrapper.kind !== "render" || !wrapper.request) return undefined;
  try {
    const validated = validateRenderRequest<QualificationCardData>(
      wrapper.request,
      compatibility,
    );
    const data = validated.request.data;
    if (
      !data ||
      typeof data !== "object" ||
      Object.keys(data).length !== 1 ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0 ||
      data.name.length > 80
    ) {
      return undefined;
    }
    return validated;
  } catch (error) {
    if (error instanceof DocumentValidationError) return undefined;
    throw error;
  }
}

export function getRequestRevision(request: PdfRenderRequest): number {
  return request.request.revision;
}

export function getResponseRevision(response: PdfRenderResponse): number {
  return response.kind === "success"
    ? response.result.revision
    : response.revision;
}
