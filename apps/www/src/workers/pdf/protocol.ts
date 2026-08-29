import {
  DocumentValidationError,
  PDF_RENDER_PROTOCOL_VERSION,
  validateRenderRequest,
  type DocumentErrorCode,
  type PdfAccentColor,
  type PrintProfile,
  type RenderRequest,
  type RenderResult,
  type ValidatedRenderRequest,
} from "@docn-ui/documents/core";
import {
  parseBusinessCardData,
  type BusinessCardData,
} from "@docn-ui/documents/templates/business-cards/schema";
import {
  getBusinessCardTemplateMetadata,
  type BusinessCardTemplateId,
} from "@docn-ui/documents/templates/business-cards/metadata";

export { PDF_RENDER_PROTOCOL_VERSION } from "@docn-ui/documents/core";

export interface PdfRenderRequest {
  kind: "render";
  request: RenderRequest<BusinessCardData>;
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

export function makePdfRenderRequest(
  revision: number,
  data: BusinessCardData,
  options: {
    formatId: RenderRequest["formatId"];
    locale: RenderRequest["locale"];
    accentColor?: PdfAccentColor | undefined;
    printProfile?: PrintProfile;
    templateId?: BusinessCardTemplateId;
    themeId: RenderRequest["themeId"];
  } = { formatId: "card-85x55", locale: "fr", themeId: "neutral" },
): PdfRenderRequest {
  return {
    kind: "render",
    request: {
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
      revision,
      templateId: options.templateId ?? "business-card-minimal",
      templateVersion: "1.0.0",
      data,
      formatId: options.formatId,
      themeId: options.themeId,
      locale: options.locale,
      overrides: options.accentColor
        ? { accentColor: options.accentColor }
        : {},
      printProfile: options.printProfile ?? { kind: "screen" },
      assetIds: [],
    },
  };
}

export function parsePdfRenderRequest(
  value: unknown,
): ValidatedRenderRequest<BusinessCardData> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const wrapper = value as Partial<PdfRenderRequest>;
  if (wrapper.kind !== "render" || !wrapper.request) return undefined;
  const metadata = getBusinessCardTemplateMetadata(
    typeof wrapper.request.templateId === "string"
      ? wrapper.request.templateId
      : "",
  );
  if (!metadata) return undefined;
  try {
    const validated = validateRenderRequest<BusinessCardData>(
      wrapper.request,
      metadata,
    );
    if (
      validated.request.templateId !== metadata.id ||
      validated.request.templateVersion !== metadata.version
    )
      return undefined;
    return {
      ...validated,
      request: {
        ...validated.request,
        data: parseBusinessCardData(validated.request.data),
      },
    };
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
