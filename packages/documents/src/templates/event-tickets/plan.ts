import type {
  PdfDocumentElement,
  FixedDocumentRenderPlan,
} from "../../render/runtime";
import {
  validateRenderRequest,
  type RenderRequest,
  type TemplateMetadata,
} from "../../core/contracts";
import { DocumentValidationError } from "../../core/errors";
import type { ResolvedFixedFormat } from "../../core/formats";
import { parseEventTicketData, type EventTicketData } from "./schema";

export interface EventTicketDocumentProps {
  data: EventTicketData;
  format: ResolvedFixedFormat;
  locale: RenderRequest["locale"];
  overrides: NonNullable<RenderRequest["overrides"]>;
  printProfile: RenderRequest["printProfile"];
  themeId: RenderRequest["themeId"];
}

export function createEventTicketPlan(
  input: unknown,
  metadata: TemplateMetadata,
  createDocument: (props: EventTicketDocumentProps) => PdfDocumentElement,
): {
  plan: FixedDocumentRenderPlan;
  request: RenderRequest<EventTicketData>;
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
        message: "Event tickets require a fixed format.",
        path: ["formatId"],
      },
    ]);
  }
  const data = parseEventTicketData(validated.request.data);
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
