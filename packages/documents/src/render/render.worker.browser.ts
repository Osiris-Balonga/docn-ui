import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import { resolveFormat } from "../core/formats";
import {
  createFontManifestIdentity,
  type JsonObject,
  type NormalizedTemplateInput,
} from "../template-contract";
import type { RenderableTemplate } from "../renderable-template";
import { getCanonicalPdfTheme } from "../themes/themes";
import { renderNormalizedPdfInBrowser } from "./browser-normalized-render";
import { createVerifiedBrowserAssetResolver } from "./verified-assets.browser";
import {
  PDF_RENDER_PROTOCOL_VERSION_V2,
  createRenderWorkerEpochGateV2,
  fingerprintWorkerRequestV2,
  receiveRenderWorkerImagesV2,
  serializeWorkerFailureV2,
  validateRenderWorkerRequestV2,
  type RenderWorkerImagesV2,
  type RenderWorkerEpochV2,
  type RenderWorkerOutboundV2,
  type RenderWorkerRequestV2,
} from "./worker-protocol-v2";

interface WorkerScope {
  location: Location;
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

const scope = globalThis as unknown as WorkerScope;
const epochGate = createRenderWorkerEpochGateV2();
let pendingRequest:
  { epoch: RenderWorkerEpochV2; request: RenderWorkerRequestV2 } | undefined;

const trustedTemplateLoaders = {
  "business-card-violet-founder": async () =>
    (await import("../templates/renderable/violet-founder-business-card"))
      .violetFounderBusinessCardRenderable,
} as const;

function workerFailure(message: string, path: readonly string[]): never {
  throw new DocumentValidationError([{ code: "INVALID_DATA", message, path }]);
}

async function validateTemplateForRequest(
  request: NormalizedTemplateInput<JsonObject>,
  themeWasExplicit: boolean,
): Promise<RenderableTemplate<JsonObject>> {
  const loader = Object.hasOwn(trustedTemplateLoaders, request.templateId)
    ? trustedTemplateLoaders[
        request.templateId as keyof typeof trustedTemplateLoaders
      ]
    : undefined;
  if (!loader) {
    return workerFailure("The worker template is not installed.", [
      "worker",
      "request",
      "templateId",
    ]);
  }
  const template =
    (await loader()) as unknown as RenderableTemplate<JsonObject>;
  if (
    template.version !== request.templateVersion ||
    template.schemaVersion !== request.schemaVersion ||
    !template.supportedFormatIds.includes(request.format.id) ||
    !template.supportedLocales.includes(request.locale) ||
    !template.supportedThemeIds.includes(request.theme.baseThemeId) ||
    !template.supportedPrintProfileKinds.includes(request.printProfile.kind)
  ) {
    return workerFailure(
      "The normalized request is incompatible with its template.",
      ["worker", "request"],
    );
  }
  const canonicalTheme = getCanonicalPdfTheme(request.theme.baseThemeId);
  const expectedFormat = resolveFormat(request.format.id);
  const sameGeometry =
    JSON.stringify(request.theme.theme.spacing) ===
      JSON.stringify(canonicalTheme.spacing) &&
    JSON.stringify(request.theme.theme.typeScale) ===
      JSON.stringify(canonicalTheme.typeScale) &&
    request.theme.theme.fonts.regularWeight ===
      canonicalTheme.fonts.regularWeight &&
    request.theme.theme.fonts.strongWeight ===
      canonicalTheme.fonts.strongWeight;
  const familiesQualified = (["body", "heading"] as const).every((role) => {
    const family = request.theme.theme.fonts[role];
    return (
      family === canonicalTheme.fonts[role] ||
      template.themeCompatibility[`${role}FontFamilies`]?.includes(family)
    );
  });
  const expectedFontIdentity = await createFontManifestIdentity(
    request.theme.theme,
  );
  const referencedImageIds = [
    ...new Set(template.extractLocalImageIds(request.data)),
  ].sort();
  const descriptorIds = request.localImageDescriptors.map(({ id }) => id);
  if (
    !sameGeometry ||
    !familiesQualified ||
    JSON.stringify(expectedFormat) !== JSON.stringify(request.format) ||
    JSON.stringify(expectedFontIdentity) !==
      JSON.stringify(request.fontManifestIdentity) ||
    !requestMessageThemeIsCompatible(
      request,
      canonicalTheme,
      themeWasExplicit,
    ) ||
    JSON.stringify(referencedImageIds) !== JSON.stringify(descriptorIds)
  ) {
    return workerFailure("The normalized theme is not qualified.", [
      "worker",
      "request",
      "theme",
    ]);
  }
  return template;
}

function requestMessageThemeIsCompatible(
  request: NormalizedTemplateInput<JsonObject>,
  canonicalTheme: ReturnType<typeof getCanonicalPdfTheme>,
  themeWasExplicit: boolean,
): boolean {
  return (
    request.theme.theme.id === request.theme.baseThemeId &&
    (themeWasExplicit ||
      JSON.stringify(request.theme.theme) === JSON.stringify(canonicalTheme))
  );
}

async function handleImages(message: RenderWorkerImagesV2): Promise<void> {
  const requestMessage = pendingRequest;
  if (
    !requestMessage ||
    requestMessage.request.jobId !== message.jobId ||
    requestMessage.request.request.revision !== message.revision ||
    !epochGate.isCurrent(requestMessage.epoch)
  ) {
    return;
  }
  pendingRequest = undefined;
  const { request } = requestMessage.request;
  try {
    const template = await validateTemplateForRequest(
      request,
      requestMessage.request.themeWasExplicit,
    );
    const images = await receiveRenderWorkerImagesV2(
      message,
      request.localImageDescriptors,
      message.jobId,
      message.revision,
    );
    if (!epochGate.isCurrent(requestMessage.epoch)) return;
    const assetResolver = await createVerifiedBrowserAssetResolver(
      scope.location.origin,
    );
    if (!epochGate.isCurrent(requestMessage.epoch)) return;
    const result = await renderNormalizedPdfInBrowser(
      template,
      request,
      images,
      assetResolver,
      requestMessage.request.themeWasExplicit,
    );
    if (!epochGate.isCurrent(requestMessage.epoch)) return;
    if (
      result.pdfBytes.byteLength > DOCUMENT_LIMITS.finalPdfBytes ||
      result.pageCount > DOCUMENT_LIMITS.pages
    ) {
      return workerFailure("The worker result exceeds document limits.", [
        "worker",
        "result",
      ]);
    }
    if (
      result.fingerprint !==
      (await fingerprintWorkerRequestV2(requestMessage.request))
    ) {
      return workerFailure("The worker result fingerprint is invalid.", [
        "worker",
        "result",
      ]);
    }
    const pdfBytes = new Uint8Array(result.pdfBytes).slice().buffer;
    const serializableResult = {
      diagnostics: result.diagnostics,
      finalDimensions: result.finalDimensions,
      fingerprint: result.fingerprint,
      pageCount: result.pageCount,
      revision: result.revision,
    };
    const response: RenderWorkerOutboundV2 = {
      jobId: message.jobId,
      pdfBytes,
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION_V2,
      result: serializableResult,
      revision: message.revision,
      type: "result",
    };
    scope.postMessage(response, [pdfBytes]);
  } catch (error) {
    if (!epochGate.isCurrent(requestMessage.epoch)) return;
    scope.postMessage(
      serializeWorkerFailureV2(message.jobId, message.revision, error),
    );
  }
}

function readIdentity(value: unknown): { jobId: number; revision: number } {
  if (value !== null && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const request =
      candidate.request !== null && typeof candidate.request === "object"
        ? (candidate.request as Record<string, unknown>)
        : undefined;
    return {
      jobId:
        Number.isSafeInteger(candidate.jobId) && (candidate.jobId as number) > 0
          ? (candidate.jobId as number)
          : 0,
      revision:
        Number.isSafeInteger(candidate.revision) &&
        (candidate.revision as number) > 0
          ? (candidate.revision as number)
          : Number.isSafeInteger(request?.revision) &&
              (request?.revision as number) > 0
            ? (request?.revision as number)
            : 0,
    };
  }
  return { jobId: 0, revision: 0 };
}

scope.onmessage = (event) => {
  const value = event.data;
  if (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    value.type === "render"
  ) {
    try {
      const request = validateRenderWorkerRequestV2(value);
      pendingRequest = {
        epoch: epochGate.begin(request.jobId, request.request.revision),
        request,
      };
    } catch (error) {
      pendingRequest = undefined;
      const identity = readIdentity(value);
      scope.postMessage(
        serializeWorkerFailureV2(identity.jobId, identity.revision, error),
      );
    }
    return;
  }
  if (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    value.type === "images"
  ) {
    void handleImages(value as RenderWorkerImagesV2);
    return;
  }
  const identity = readIdentity(value);
  scope.postMessage(
    serializeWorkerFailureV2(
      identity.jobId,
      identity.revision,
      new DocumentValidationError([
        {
          code: "INVALID_DATA",
          message: "Invalid worker protocol message.",
          path: ["worker"],
        },
      ]),
    ),
  );
};
