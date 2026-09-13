import { assetManifest } from "../assets/manifest";
import type { RenderResult } from "../core/contracts";
import { DOCUMENT_LIMITS, THEME_IDS } from "../core/contracts";
import type { DocumentIssue } from "../core/errors";
import { DocumentValidationError } from "../core/errors";
import { FORMAT_IDS } from "../core/formats";
import { isTemplateId } from "../template-ids";
import {
  fingerprintNormalizedTemplateInput,
  parseLocalImageId,
  type JsonObject,
  type LocalImageDescriptor,
  type LocalImageId,
  type NormalizedTemplateInput,
} from "../template-contract";
import {
  inspectCanonicalLocalImageBytes,
  type PreparedLocalImages,
} from "./local-images";

export const PDF_RENDER_PROTOCOL_VERSION_V2 = 2 as const;

export interface RenderWorkerRequestV2 {
  readonly dispatchId: number;
  readonly jobId: number;
  readonly protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION_V2;
  readonly request: NormalizedTemplateInput<JsonObject>;
  readonly themeWasExplicit: boolean;
  readonly type: "render";
}

export interface RenderWorkerImageV2 {
  readonly bytes: ArrayBuffer;
  readonly id: LocalImageId;
  readonly sha256: `sha256:${string}`;
}

export interface RenderWorkerImagesV2 {
  readonly dispatchId: number;
  readonly images: readonly RenderWorkerImageV2[];
  readonly jobId: number;
  readonly protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION_V2;
  readonly revision: number;
  readonly type: "images";
}

export interface RenderWorkerSuccessV2 {
  readonly jobId: number;
  readonly pdfBytes: ArrayBuffer;
  readonly protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION_V2;
  readonly result: Omit<RenderResult, "pdfBytes">;
  readonly revision: number;
  readonly type: "result";
}

export interface RenderWorkerFailureV2 {
  readonly issues: readonly DocumentIssue[];
  readonly jobId: number;
  readonly protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION_V2;
  readonly revision: number;
  readonly type: "error";
}

export type RenderWorkerInboundV2 =
  RenderWorkerImagesV2 | RenderWorkerRequestV2;
export type RenderWorkerOutboundV2 =
  RenderWorkerFailureV2 | RenderWorkerSuccessV2;

export interface RenderWorkerEpochV2 {
  readonly epoch: number;
  readonly jobId: number;
  readonly revision: number;
}

export interface AcceptedRenderWorkerRequestV2 {
  readonly epoch: RenderWorkerEpochV2;
  readonly request: RenderWorkerRequestV2;
}

export function createRenderWorkerEpochGateV2() {
  let current: RenderWorkerEpochV2 | undefined;
  let sequence = 0;
  return Object.freeze({
    begin(jobId: number, revision: number): RenderWorkerEpochV2 {
      sequence += 1;
      current = Object.freeze({ epoch: sequence, jobId, revision });
      return current;
    },
    isCurrent(candidate: RenderWorkerEpochV2): boolean {
      return (
        current?.epoch === candidate.epoch &&
        current.jobId === candidate.jobId &&
        current.revision === candidate.revision
      );
    },
  });
}

export async function settleRenderWorkerEpochV2<T>(
  gate: { isCurrent(epoch: RenderWorkerEpochV2): boolean },
  epoch: RenderWorkerEpochV2,
  pending: Promise<T>,
): Promise<{ current: true; value: T } | { current: false }> {
  const value = await pending;
  return gate.isCurrent(epoch) ? { current: true, value } : { current: false };
}

export function createRenderWorkerInboxV2() {
  const epochGate = createRenderWorkerEpochGateV2();
  let highestDispatchId = 0;
  let pending: AcceptedRenderWorkerRequestV2 | undefined;
  return Object.freeze({
    accept(
      request: RenderWorkerRequestV2,
    ): AcceptedRenderWorkerRequestV2 | undefined {
      if (request.dispatchId <= highestDispatchId) return undefined;
      highestDispatchId = request.dispatchId;
      pending = Object.freeze({
        epoch: epochGate.begin(request.jobId, request.request.revision),
        request,
      });
      return pending;
    },
    claim(
      images: RenderWorkerImagesV2,
    ): AcceptedRenderWorkerRequestV2 | undefined {
      const candidate = pending;
      if (
        !candidate ||
        !epochGate.isCurrent(candidate.epoch) ||
        !matchesRenderWorkerDispatchV2(candidate.request, images)
      ) {
        return undefined;
      }
      pending = undefined;
      return candidate;
    },
    isCurrent(epoch: RenderWorkerEpochV2): boolean {
      return epochGate.isCurrent(epoch);
    },
  });
}

function protocolFailure(message: string, path: readonly string[]): never {
  throw new DocumentValidationError([{ code: "INVALID_DATA", message, path }]);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function finitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function assertJsonValue(
  value: unknown,
  path: readonly string[],
  depth = 0,
  ancestors = new Set<object>(),
): void {
  if (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  )
    return;
  if (typeof value === "string") {
    if (
      value.length > DOCUMENT_LIMITS.generalStringCharacters ||
      value.normalize("NFC") !== value
    )
      protocolFailure("Worker protocol string exceeds its limit.", path);
    return;
  }
  if (depth > DOCUMENT_LIMITS.dataDepth + 5)
    protocolFailure("Worker protocol JSON exceeds its depth limit.", path);
  if (Array.isArray(value)) {
    if (value.length > 4_096 || ancestors.has(value))
      protocolFailure(
        "Worker protocol JSON exceeds its structural limits.",
        path,
      );
    const next = new Set(ancestors).add(value);
    value.forEach((item, index) =>
      assertJsonValue(item, [...path, String(index)], depth + 1, next),
    );
    return;
  }
  if (
    !isPlainRecord(value) ||
    ancestors.has(value) ||
    Object.keys(value).length > 1_024
  )
    protocolFailure("Worker protocol values must be bounded JSON data.", path);
  const next = new Set(ancestors).add(value);
  for (const [key, item] of Object.entries(value)) {
    if (key.length > 120 || key.normalize("NFC") !== key)
      protocolFailure("Worker protocol key exceeds its limit.", path);
    assertJsonValue(item, [...path, key], depth + 1, next);
  }
}

function assertExactNumberRecord(
  value: unknown,
  keys: readonly string[],
  path: readonly string[],
): asserts value is Record<string, number> {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, keys) ||
    keys.some((key) => !finitePositive(value[key]))
  )
    protocolFailure("Invalid normalized dimensions.", path);
}

function assertNormalizedFormat(value: unknown): void {
  if (
    !isPlainRecord(value) ||
    typeof value.id !== "string" ||
    !FORMAT_IDS.includes(value.id as never)
  )
    protocolFailure("Invalid normalized format.", [
      "worker",
      "request",
      "format",
    ]);
  if (value.kind === "fixed") {
    if (
      !hasExactKeys(value, [
        "id",
        "kind",
        "orientation",
        "safeAreaMm",
        "trim",
      ]) ||
      (value.orientation !== "landscape" && value.orientation !== "portrait") ||
      typeof value.safeAreaMm !== "number"
    )
      protocolFailure("Invalid normalized fixed format.", [
        "worker",
        "request",
        "format",
      ]);
    assertExactNumberRecord(
      value.trim,
      ["heightMm", "heightPt", "widthMm", "widthPt"],
      ["worker", "request", "format", "trim"],
    );
    return;
  }
  if (value.kind === "continuous") {
    if (
      !hasExactKeys(value, [
        "id",
        "kind",
        "maxHeightMm",
        "maxHeightPt",
        "safeAreaMm",
        "widthMm",
        "widthPt",
      ]) ||
      ![
        value.maxHeightMm,
        value.maxHeightPt,
        value.widthMm,
        value.widthPt,
      ].every(finitePositive) ||
      typeof value.safeAreaMm !== "number"
    )
      protocolFailure("Invalid normalized continuous format.", [
        "worker",
        "request",
        "format",
      ]);
    return;
  }
  protocolFailure("Invalid normalized format kind.", [
    "worker",
    "request",
    "format",
    "kind",
  ]);
}

function assertNormalizedTheme(value: unknown): void {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, ["baseThemeId", "theme"]) ||
    typeof value.baseThemeId !== "string" ||
    !THEME_IDS.includes(value.baseThemeId as never) ||
    !isPlainRecord(value.theme)
  )
    protocolFailure("Invalid normalized theme.", [
      "worker",
      "request",
      "theme",
    ]);
  const theme = value.theme;
  if (
    !hasExactKeys(theme, ["colors", "fonts", "id", "spacing", "typeScale"]) ||
    theme.id !== value.baseThemeId ||
    !isPlainRecord(theme.colors) ||
    !hasExactKeys(theme.colors, [
      "accent",
      "border",
      "canvas",
      "invertedText",
      "mutedText",
      "surface",
      "text",
    ]) ||
    Object.values(theme.colors).some(
      (color) => typeof color !== "string" || !/^#[0-9a-f]{6}$/u.test(color),
    ) ||
    !isPlainRecord(theme.fonts) ||
    !hasExactKeys(theme.fonts, [
      "body",
      "heading",
      "regularWeight",
      "strongWeight",
    ]) ||
    ![theme.fonts.body, theme.fonts.heading].every(
      (family) => family === "Noto Sans" || family === "Noto Serif",
    ) ||
    theme.fonts.regularWeight !== 400 ||
    theme.fonts.strongWeight !== 700
  )
    protocolFailure("Invalid normalized theme tokens.", [
      "worker",
      "request",
      "theme",
    ]);
  assertExactNumberRecord(
    theme.spacing,
    ["lg", "md", "sm", "xl", "xs"],
    ["worker", "request", "theme", "spacing"],
  );
  assertExactNumberRecord(
    theme.typeScale,
    ["body", "caption", "display", "heading", "label"],
    ["worker", "request", "theme", "typeScale"],
  );
}

function assertPrintProfile(value: unknown): void {
  if (!isPlainRecord(value))
    protocolFailure("Invalid normalized print profile.", [
      "worker",
      "request",
      "printProfile",
    ]);
  if (value.kind === "screen" && hasExactKeys(value, ["kind"])) return;
  if (
    value.kind === "print" &&
    hasExactKeys(value, ["bleedMm", "cropMarks", "kind"]) &&
    (value.bleedMm === 0 || value.bleedMm === 3) &&
    typeof value.cropMarks === "boolean"
  )
    return;
  protocolFailure("Invalid normalized print profile.", [
    "worker",
    "request",
    "printProfile",
  ]);
}

function assertFontIdentity(value: unknown): void {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, ["assetIds", "schemaVersion", "sha256"]) ||
    value.schemaVersion !== assetManifest.schemaVersion ||
    !Array.isArray(value.assetIds) ||
    value.assetIds.some((id) => typeof id !== "string") ||
    typeof value.sha256 !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(value.sha256)
  )
    protocolFailure("Invalid normalized font identity.", [
      "worker",
      "request",
      "fontManifestIdentity",
    ]);
  const ids = value.assetIds as string[];
  if (
    ids.length < 2 ||
    ids.length > assetManifest.assets.length ||
    ids.some(
      (id, index) =>
        id !== [...ids].sort()[index] ||
        !assetManifest.assets.some((asset) => asset.id === id),
    )
  )
    protocolFailure("Invalid normalized font assets.", [
      "worker",
      "request",
      "fontManifestIdentity",
      "assetIds",
    ]);
}

function validateDescriptor(
  value: unknown,
  index: number,
): LocalImageDescriptor {
  const path = ["worker", "request", "localImageDescriptors", String(index)];
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, [
      "byteLength",
      "heightPx",
      "id",
      "mimeType",
      "sha256",
      "widthPx",
    ])
  )
    protocolFailure("Invalid worker image descriptor.", path);
  parseLocalImageId(value.id, path);
  if (
    !Number.isSafeInteger(value.byteLength) ||
    (value.byteLength as number) < 1 ||
    (value.byteLength as number) > DOCUMENT_LIMITS.imageBytes ||
    (value.mimeType !== "image/png" && value.mimeType !== "image/jpeg") ||
    typeof value.sha256 !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(value.sha256) ||
    !Number.isSafeInteger(value.widthPx) ||
    (value.widthPx as number) < 1 ||
    !Number.isSafeInteger(value.heightPx) ||
    (value.heightPx as number) < 1 ||
    (value.widthPx as number) * (value.heightPx as number) >
      DOCUMENT_LIMITS.imagePixels
  )
    protocolFailure("Invalid worker image descriptor values.", path);
  return value as unknown as LocalImageDescriptor;
}

export function validateRenderWorkerRequestV2(
  value: unknown,
): RenderWorkerRequestV2 {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, [
      "dispatchId",
      "jobId",
      "protocolVersion",
      "request",
      "themeWasExplicit",
      "type",
    ]) ||
    value.protocolVersion !== PDF_RENDER_PROTOCOL_VERSION_V2 ||
    value.type !== "render" ||
    typeof value.themeWasExplicit !== "boolean" ||
    !isPlainRecord(value.request)
  )
    protocolFailure("Invalid render worker request.", ["worker"]);
  if (!Number.isSafeInteger(value.jobId) || (value.jobId as number) < 1)
    protocolFailure("Invalid render worker job ID.", ["worker", "jobId"]);
  if (
    !Number.isSafeInteger(value.dispatchId) ||
    (value.dispatchId as number) < 1
  )
    protocolFailure("Invalid render worker dispatch ID.", [
      "worker",
      "dispatchId",
    ]);
  const request = value.request;
  if (
    !hasExactKeys(request, [
      "data",
      "fontManifestIdentity",
      "format",
      "localImageDescriptors",
      "locale",
      "printProfile",
      "revision",
      "schemaVersion",
      "templateId",
      "templateVersion",
      "theme",
    ])
  )
    protocolFailure("Invalid normalized worker request fields.", [
      "worker",
      "request",
    ]);
  assertJsonValue(request, ["worker", "request"]);
  if (
    !Number.isSafeInteger(request.revision) ||
    (request.revision as number) < 1 ||
    !Number.isSafeInteger(request.schemaVersion) ||
    (request.schemaVersion as number) < 1 ||
    typeof request.templateVersion !== "string" ||
    request.templateVersion.length < 1 ||
    request.templateVersion.length > 40 ||
    (request.locale !== "en" && request.locale !== "fr") ||
    typeof request.templateId !== "string" ||
    !isTemplateId(request.templateId)
  )
    protocolFailure("Invalid normalized worker request identity.", [
      "worker",
      "request",
    ]);
  const dataBytes = new TextEncoder().encode(
    JSON.stringify(request.data),
  ).byteLength;
  if (!isPlainRecord(request.data) || dataBytes > DOCUMENT_LIMITS.dataBytes)
    protocolFailure("Invalid normalized template data.", [
      "worker",
      "request",
      "data",
    ]);
  assertNormalizedFormat(request.format);
  assertNormalizedTheme(request.theme);
  assertPrintProfile(request.printProfile);
  assertFontIdentity(request.fontManifestIdentity);
  if (
    !Array.isArray(request.localImageDescriptors) ||
    request.localImageDescriptors.length > DOCUMENT_LIMITS.permittedAssets
  )
    protocolFailure("Invalid worker image descriptors.", [
      "worker",
      "request",
      "localImageDescriptors",
    ]);
  const descriptors = request.localImageDescriptors.map(validateDescriptor);
  if (
    descriptors.some(
      (item, index) => index > 0 && item.id <= descriptors[index - 1]!.id,
    )
  )
    protocolFailure("Worker image descriptors must be unique and sorted.", [
      "worker",
      "request",
      "localImageDescriptors",
    ]);
  return value as unknown as RenderWorkerRequestV2;
}

export function createRenderWorkerImagesV2(
  jobId: number,
  revision: number,
  dispatchId: number,
  images: PreparedLocalImages,
): { message: RenderWorkerImagesV2; transfer: readonly ArrayBuffer[] } {
  const transfer: ArrayBuffer[] = [];
  const payload = images.map(({ bytes, descriptor }) => {
    const buffer = new Uint8Array(bytes).slice().buffer;
    transfer.push(buffer);
    return Object.freeze({
      bytes: buffer,
      id: descriptor.id,
      sha256: descriptor.sha256,
    });
  });
  return {
    message: Object.freeze({
      dispatchId,
      images: Object.freeze(payload),
      jobId,
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION_V2,
      revision,
      type: "images" as const,
    }),
    transfer,
  };
}

async function sha256(bytes: Uint8Array): Promise<`sha256:${string}`> {
  const owned = new Uint8Array(bytes).slice();
  const digest = await crypto.subtle.digest("SHA-256", owned.buffer);
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function receiveRenderWorkerImagesV2(
  value: unknown,
  descriptors: readonly LocalImageDescriptor[],
  expectedJobId: number,
  expectedRevision: number,
  expectedDispatchId: number,
): Promise<PreparedLocalImages> {
  if (
    !isPlainRecord(value) ||
    !hasExactKeys(value, [
      "dispatchId",
      "images",
      "jobId",
      "protocolVersion",
      "revision",
      "type",
    ]) ||
    value.protocolVersion !== PDF_RENDER_PROTOCOL_VERSION_V2 ||
    value.type !== "images" ||
    value.jobId !== expectedJobId ||
    value.revision !== expectedRevision ||
    value.dispatchId !== expectedDispatchId ||
    !Array.isArray(value.images) ||
    value.images.length !== descriptors.length
  )
    protocolFailure("Invalid worker image transfer.", ["worker", "images"]);
  const prepared: { bytes: Uint8Array; descriptor: LocalImageDescriptor }[] =
    [];
  for (let index = 0; index < descriptors.length; index += 1) {
    const image = value.images[index];
    const descriptor = descriptors[index]!;
    if (
      !isPlainRecord(image) ||
      !hasExactKeys(image, ["bytes", "id", "sha256"]) ||
      !(image.bytes instanceof ArrayBuffer) ||
      image.id !== descriptor.id ||
      image.sha256 !== descriptor.sha256
    )
      protocolFailure("Worker image transfer does not match its descriptor.", [
        "worker",
        "images",
        String(index),
      ]);
    const bytes = new Uint8Array(image.bytes).slice();
    const inspected = inspectCanonicalLocalImageBytes(bytes, [
      "worker",
      "images",
      String(index),
    ]);
    if (
      bytes.byteLength !== descriptor.byteLength ||
      inspected.mimeType !== descriptor.mimeType ||
      inspected.widthPx !== descriptor.widthPx ||
      inspected.heightPx !== descriptor.heightPx ||
      (await sha256(bytes)) !== descriptor.sha256
    )
      protocolFailure("Worker image payload failed integrity checks.", [
        "worker",
        "images",
        String(index),
      ]);
    prepared.push(Object.freeze({ bytes, descriptor }));
  }
  return Object.freeze(prepared);
}

export function matchesRenderWorkerDispatchV2(
  request: RenderWorkerRequestV2,
  images: RenderWorkerImagesV2,
): boolean {
  return (
    request.jobId === images.jobId &&
    request.request.revision === images.revision &&
    request.dispatchId === images.dispatchId
  );
}

export function fingerprintWorkerRequestV2(
  request: RenderWorkerRequestV2,
): Promise<`sha256:${string}`> {
  return fingerprintNormalizedTemplateInput(request.request);
}

export function serializeWorkerFailureV2(
  jobId: number,
  revision: number,
  error: unknown,
): RenderWorkerFailureV2 {
  const code =
    error instanceof DocumentValidationError ? error.code : "RENDER_FAILED";
  return {
    issues: [
      {
        code,
        message: "The worker could not render the document.",
        path: ["worker"],
      },
    ],
    jobId,
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION_V2,
    revision,
    type: "error",
  };
}
