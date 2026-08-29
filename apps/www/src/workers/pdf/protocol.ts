import {
  DocumentValidationError,
  DOCUMENT_LIMITS,
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
  assets: readonly PdfUserAsset[];
  kind: "render";
  request: RenderRequest<BusinessCardData>;
}

export interface PdfUserAsset {
  bytes: ArrayBuffer;
  height: number;
  id: string;
  mimeType: "image/jpeg" | "image/png";
  width: number;
}

export interface ParsedPdfRenderRequest extends ValidatedRenderRequest<BusinessCardData> {
  assets: readonly PdfUserAsset[];
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
    assets?: readonly PdfUserAsset[];
    printProfile?: PrintProfile;
    templateId?: BusinessCardTemplateId;
    themeId: RenderRequest["themeId"];
  } = { formatId: "card-85x55", locale: "fr", themeId: "neutral" },
): PdfRenderRequest {
  const assets = (options.assets ?? []).map((asset) => ({
    ...asset,
    bytes: asset.bytes.slice(0),
  }));
  return {
    assets,
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
      assetIds: assets.map((asset) => asset.id),
    },
  };
}

export function parsePdfRenderRequest(
  value: unknown,
): ParsedPdfRenderRequest | undefined {
  if (!value || typeof value !== "object") return undefined;
  const wrapper = value as Partial<PdfRenderRequest>;
  if (wrapper.kind !== "render" || !wrapper.request) return undefined;
  const assets = parseUserAssets(wrapper.assets, wrapper.request.assetIds);
  if (!assets) return undefined;
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
    const data = parseBusinessCardData(validated.request.data);
    if (
      (data.logoAssetId &&
        (!metadata.capabilities.logo ||
          !assets.some((asset) => asset.id === data.logoAssetId))) ||
      (!data.logoAssetId && assets.length > 0)
    )
      return undefined;
    return {
      ...validated,
      assets,
      request: {
        ...validated.request,
        data,
      },
    };
  } catch (error) {
    if (error instanceof DocumentValidationError) return undefined;
    throw error;
  }
}

function parseUserAssets(
  value: unknown,
  assetIds: readonly string[],
): readonly PdfUserAsset[] | undefined {
  if (!Array.isArray(value) || value.length > DOCUMENT_LIMITS.permittedAssets)
    return undefined;
  const assets: PdfUserAsset[] = [];
  const ids = new Set<string>();
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") return undefined;
    const asset = candidate as Partial<PdfUserAsset>;
    if (
      typeof asset.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(asset.id) ||
      ids.has(asset.id) ||
      !(asset.bytes instanceof ArrayBuffer) ||
      asset.bytes.byteLength === 0 ||
      asset.bytes.byteLength > DOCUMENT_LIMITS.imageBytes ||
      (asset.mimeType !== "image/png" && asset.mimeType !== "image/jpeg") ||
      !Number.isSafeInteger(asset.width) ||
      !Number.isSafeInteger(asset.height) ||
      Number(asset.width) <= 0 ||
      Number(asset.height) <= 0 ||
      Number(asset.width) * Number(asset.height) > DOCUMENT_LIMITS.imagePixels
    )
      return undefined;
    ids.add(asset.id);
    assets.push(asset as PdfUserAsset);
  }
  if (
    assetIds.length !== assets.length ||
    assetIds.some((assetId) => !ids.has(assetId))
  )
    return undefined;
  return assets;
}

export function getRequestRevision(request: PdfRenderRequest): number {
  return request.request.revision;
}

export function getResponseRevision(response: PdfRenderResponse): number {
  return response.kind === "success"
    ? response.result.revision
    : response.revision;
}
