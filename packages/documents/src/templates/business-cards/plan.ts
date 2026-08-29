import type {
  PdfDocumentElement,
  FixedDocumentRenderPlan,
} from "../../render/runtime";
import {
  DocumentValidationError,
  validateRenderRequest,
  type RenderRequest,
  type TemplateMetadata,
} from "../../core";
import type { ResolvedFixedFormat } from "../../core/formats";
import { parseBusinessCardData, type BusinessCardData } from "./schema";

export interface BusinessCardDocumentProps {
  data: BusinessCardData;
  format: ResolvedFixedFormat;
  locale: RenderRequest["locale"];
  printProfile: RenderRequest["printProfile"];
  themeId: RenderRequest["themeId"];
}

export function createBusinessCardPlan(
  input: unknown,
  metadata: TemplateMetadata,
  createDocument: (props: BusinessCardDocumentProps) => PdfDocumentElement,
): {
  plan: FixedDocumentRenderPlan;
  request: RenderRequest<BusinessCardData>;
} {
  const validated = validateRenderRequest(input, metadata);
  if (
    validated.request.templateId !== metadata.id ||
    validated.request.templateVersion !== metadata.version
  ) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: "The render request does not match the selected template.",
        path: ["templateId"],
      },
    ]);
  }
  if (validated.format.kind !== "fixed") {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: "Business cards require a fixed format.",
        path: ["formatId"],
      },
    ]);
  }
  const data = parseBusinessCardData(validated.request.data);
  const request = { ...validated.request, data };
  return {
    request,
    plan: {
      document: createDocument({
        data,
        format: validated.format,
        locale: request.locale,
        printProfile: request.printProfile,
        themeId: request.themeId,
      }),
      format: validated.format,
      printProfile: request.printProfile,
    },
  };
}
