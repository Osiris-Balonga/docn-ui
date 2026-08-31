import {
  validateRenderRequest,
  type RenderRequest,
  type TemplateMetadata,
} from "../../core/contracts";
import { DocumentValidationError } from "../../core/errors";
import type { ResolvedFixedFormat } from "../../core/formats";
import type {
  FixedDocumentRenderPlan,
  PdfDocumentElement,
} from "../../render/runtime";
import { parseInvoiceData, type InvoiceData } from "./schema";

export interface InvoiceDocumentProps {
  data: InvoiceData;
  format: ResolvedFixedFormat;
  locale: RenderRequest["locale"];
  overrides: NonNullable<RenderRequest["overrides"]>;
  printProfile: RenderRequest["printProfile"];
  themeId: RenderRequest["themeId"];
}

export function createInvoicePlan(
  input: unknown,
  metadata: TemplateMetadata,
  createDocument: (props: InvoiceDocumentProps) => PdfDocumentElement,
): {
  plan: FixedDocumentRenderPlan;
  request: RenderRequest<InvoiceData>;
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
  if (
    validated.format.kind !== "fixed" ||
    !["a4", "letter"].includes(validated.format.id)
  ) {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: "Invoices require an A4 or Letter portrait format.",
        path: ["formatId"],
      },
    ]);
  }
  const data = parseInvoiceData(validated.request.data);
  const request = { ...validated.request, data };
  return {
    request,
    plan: {
      document: createDocument({
        data,
        format: validated.format,
        locale: request.locale,
        overrides: request.overrides ?? {},
        printProfile: request.printProfile,
        themeId: request.themeId,
      }),
      format: validated.format,
      printProfile: request.printProfile,
    },
  };
}
