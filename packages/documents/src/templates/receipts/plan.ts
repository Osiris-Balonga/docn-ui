import type { RenderRequest, TemplateMetadata } from "../../core/contracts";
import { validateRenderRequest } from "../../core/contracts";
import { DocumentValidationError } from "../../core/errors";
import type { ResolvedContinuousFormat } from "../../core/formats";
import type {
  ContinuousDocumentRenderPlan,
  PdfDocumentElement,
} from "../../render/runtime";
import { parseReceiptData, type ReceiptData } from "./schema";

export interface ReceiptDocumentProps {
  data: ReceiptData;
  finalMarker: string;
  format: ResolvedContinuousFormat;
  heightPt: number;
  locale: RenderRequest["locale"];
  logoSource?: string | undefined;
  overrides: NonNullable<RenderRequest["overrides"]>;
  themeId: RenderRequest["themeId"];
}

export interface ReceiptPlanOptions {
  assetSources?: Readonly<Record<string, string>>;
}

export function createReceiptPlan(
  input: unknown,
  metadata: TemplateMetadata,
  createDocument: (props: ReceiptDocumentProps) => PdfDocumentElement,
  options: ReceiptPlanOptions = {},
): {
  plan: ContinuousDocumentRenderPlan;
  request: RenderRequest<ReceiptData>;
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
  if (validated.format.kind !== "continuous") {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: "Receipts require a continuous 58 or 80 mm format.",
        path: ["formatId"],
      },
    ]);
  }
  if (validated.request.printProfile.kind !== "screen") {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: "Thermal receipts do not support bleed or crop marks.",
        path: ["printProfile"],
      },
    ]);
  }
  const format = validated.format;
  const data = parseReceiptData(validated.request.data);
  const logoSource = data.merchant.logoAssetId
    ? options.assetSources?.[data.merchant.logoAssetId]
    : undefined;
  if (data.merchant.logoAssetId && !logoSource) {
    throw new DocumentValidationError([
      {
        code: "ASSET_REJECTED",
        message: "The selected merchant logo asset is unavailable.",
        path: ["data", "merchant", "logoAssetId"],
      },
    ]);
  }
  const request = { ...validated.request, data };
  const finalMarker = `END · ${data.number}`;
  return {
    request,
    plan: {
      finalMarker,
      format,
      createDocument: (heightPt) =>
        createDocument({
          data,
          finalMarker,
          format,
          heightPt,
          locale: request.locale,
          logoSource,
          overrides: request.overrides ?? {},
          themeId: request.themeId,
        }),
    },
  };
}
