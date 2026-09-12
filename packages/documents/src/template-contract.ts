import { z } from "zod";
import { assetManifest } from "./assets/manifest";
import {
  DOCUMENT_LIMITS,
  THEME_IDS,
  inspectDocumentData,
  type DocumentLocale,
  type ThemeId,
} from "./core/contracts";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentErrorCode,
  type DocumentIssue,
} from "./core/errors";
import {
  FORMAT_IDS,
  resolveFormat,
  resolvePrintProfile,
  type FormatId,
  type Orientation,
  type PrintProfile,
  type ResolvedFormat,
} from "./core/formats";
import { isTemplateId, type TemplateId } from "./template-ids";
import {
  getCanonicalPdfTheme,
  isCanonicalPdfTheme,
  validateCustomPdfTheme,
  type CustomPdfTheme,
  type PdfTheme,
} from "./themes/themes";

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type PresetFormatId = Exclude<FormatId, "label-custom">;
export type FormatInput =
  | PresetFormatId
  | {
      heightMm: number;
      id: "label-custom";
      orientation?: Orientation;
      widthMm: number;
    };

export type ThemeInput =
  ThemeId | (PdfTheme & { readonly baseThemeId?: never }) | CustomPdfTheme;

export type TemplateFamily =
  "badge" | "business-card" | "invoice" | "receipt" | "report" | "resume";

export type QualifiedPdfFontFamily = PdfTheme["fonts"]["body"];
export type PrintProfileKind = PrintProfile["kind"];

declare const localImageIdBrand: unique symbol;
export type LocalImageId = string & {
  readonly [localImageIdBrand]: "LocalImageId";
};
export type LocalImageMimeType = "image/jpeg" | "image/png";

export interface LocalImageDescriptor {
  readonly byteLength: number;
  readonly heightPx: number;
  readonly id: LocalImageId;
  readonly mimeType: LocalImageMimeType;
  readonly sha256: `sha256:${string}`;
  readonly widthPx: number;
}

export interface FontManifestIdentity {
  readonly assetIds: readonly string[];
  readonly schemaVersion: number;
  readonly sha256: `sha256:${string}`;
}

export interface TemplateRenderInput<TData extends JsonObject> {
  data: TData;
  format?: FormatInput;
  locale?: DocumentLocale;
  printProfile?: PrintProfile;
  revision?: number;
  theme?: ThemeInput;
}

export interface TemplateDescriptor<TData extends JsonObject> {
  defaultData: TData;
  defaultFormatId: PresetFormatId;
  defaultLocale: DocumentLocale;
  defaultPrintProfile: PrintProfile;
  defaultThemeId: ThemeId;
  exampleData: TData;
  extractLocalImageIds(data: TData): readonly LocalImageId[];
  family: TemplateFamily;
  id: TemplateId;
  schema: z.ZodType<TData, z.ZodTypeDef, unknown>;
  schemaVersion: number;
  supportedFormatIds: readonly FormatId[];
  supportedLocales: readonly DocumentLocale[];
  supportedPrintProfileKinds: readonly PrintProfileKind[];
  supportedThemeIds: readonly ThemeId[];
  themeCompatibility: {
    bodyFontFamilies?: readonly QualifiedPdfFontFamily[];
    headingFontFamilies?: readonly QualifiedPdfFontFamily[];
  };
  version: string;
}

export interface NormalizationContext {
  fontManifestIdentity: FontManifestIdentity;
  localImageDescriptors: readonly LocalImageDescriptor[];
}

export type DeepReadonly<TValue> = TValue extends JsonPrimitive
  ? TValue
  : TValue extends (...args: never[]) => unknown
    ? TValue
    : TValue extends readonly unknown[]
      ? { readonly [TKey in keyof TValue]: DeepReadonly<TValue[TKey]> }
      : TValue extends object
        ? { readonly [TKey in keyof TValue]: DeepReadonly<TValue[TKey]> }
        : TValue;

export interface ResolvedTemplateTheme {
  readonly baseThemeId: ThemeId;
  readonly theme: DeepReadonly<PdfTheme>;
}

export interface NormalizedTemplateInput<TData extends JsonObject> {
  readonly data: TData;
  readonly fontManifestIdentity: FontManifestIdentity;
  readonly format: DeepReadonly<ResolvedFormat>;
  readonly localImageDescriptors: readonly LocalImageDescriptor[];
  readonly locale: DocumentLocale;
  readonly printProfile: DeepReadonly<PrintProfile>;
  readonly revision: number;
  readonly schemaVersion: number;
  readonly templateId: TemplateId;
  readonly templateVersion: string;
  readonly theme: ResolvedTemplateTheme;
}

const localImageIdSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case image ID.");
const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const fontManifestIdentitySchema = z
  .object({
    assetIds: z.array(z.string().min(1)),
    schemaVersion: z.number().int().positive(),
    sha256: sha256Schema,
  })
  .strict();
const localImageDescriptorSchema = z
  .object({
    id: localImageIdSchema,
    mimeType: z.enum(["image/png", "image/jpeg"]),
    byteLength: z.number().int().positive().max(DOCUMENT_LIMITS.imageBytes),
    widthPx: z.number().int().positive(),
    heightPx: z.number().int().positive(),
    sha256: sha256Schema,
  })
  .strict();
const templateRenderInputSchema = z
  .object({
    data: z.unknown(),
    theme: z.unknown().optional(),
    format: z.unknown().optional(),
    locale: z.unknown().optional(),
    printProfile: z.unknown().optional(),
    revision: z.unknown().optional(),
  })
  .strict();

const knownFontFamilies = new Set(
  assetManifest.assets.map((asset) => asset.family),
);
const registeredDescriptors = new WeakSet<object>();

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function throwIssues(issues: readonly DocumentIssue[]): never {
  const [first, ...rest] = issues;
  if (!first) throw new Error("Validation failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}

function issue(
  code: DocumentErrorCode,
  message: string,
  path: readonly (number | string)[],
): DocumentIssue {
  return { code, message, path };
}

function clone<TValue>(value: TValue): TValue {
  return structuredClone(value);
}

function deepFreeze<TValue>(value: TValue): DeepReadonly<TValue> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<TValue>;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => compareCodeUnits(left, right))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
}

const SHA256_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
] as const;

function rotateRight(value: number, shift: number): number {
  return (value >>> shift) | (value << (32 - shift));
}

function sha256BytesSync(bytes: Uint8Array): `sha256:${string}` {
  const bitLength = bytes.byteLength * 8;
  const paddedLength = Math.ceil((bytes.byteLength + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.byteLength] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x1_0000_0000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  const hash = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const words = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4);
    }
    for (let index = 16; index < 64; index += 1) {
      const previous15 = words[index - 15] ?? 0;
      const previous2 = words[index - 2] ?? 0;
      const sigma0 =
        rotateRight(previous15, 7) ^
        rotateRight(previous15, 18) ^
        (previous15 >>> 3);
      const sigma1 =
        rotateRight(previous2, 17) ^
        rotateRight(previous2, 19) ^
        (previous2 >>> 10);
      words[index] =
        ((words[index - 16] ?? 0) +
          sigma0 +
          (words[index - 7] ?? 0) +
          sigma1) >>>
        0;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const sum1 =
        rotateRight(e!, 6) ^ rotateRight(e!, 11) ^ rotateRight(e!, 25);
      const choice = (e! & f!) ^ (~e! & g!);
      const temporary1 =
        (h! + sum1 + choice + SHA256_CONSTANTS[index]! + words[index]!) >>> 0;
      const sum0 =
        rotateRight(a!, 2) ^ rotateRight(a!, 13) ^ rotateRight(a!, 22);
      const majority = (a! & b!) ^ (a! & c!) ^ (b! & c!);
      const temporary2 = (sum0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d! + temporary1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temporary1 + temporary2) >>> 0;
    }
    hash[0] = (hash[0]! + a!) >>> 0;
    hash[1] = (hash[1]! + b!) >>> 0;
    hash[2] = (hash[2]! + c!) >>> 0;
    hash[3] = (hash[3]! + d!) >>> 0;
    hash[4] = (hash[4]! + e!) >>> 0;
    hash[5] = (hash[5]! + f!) >>> 0;
    hash[6] = (hash[6]! + g!) >>> 0;
    hash[7] = (hash[7]! + h!) >>> 0;
  }
  return `sha256:${Array.from(hash, (word) => word.toString(16).padStart(8, "0")).join("")}`;
}

function canonicalSha256Sync(value: unknown): `sha256:${string}` {
  return sha256BytesSync(new TextEncoder().encode(canonicalJson(value)));
}

async function sha256(value: unknown): Promise<`sha256:${string}`> {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `sha256:${hex}`;
}

function rebaseIssues(
  issues: readonly DocumentIssue[],
  root: string,
): DocumentIssue[] {
  return issues.map((item) => ({
    ...item,
    path: [root, ...item.path.slice(1)],
  }));
}

function validateFixture<TData extends JsonObject>(
  schema: z.ZodType<TData, z.ZodTypeDef, unknown>,
  value: unknown,
  root: "data" | "defaultData" | "exampleData",
): TData {
  const rawInspection = inspectDocumentData(value);
  if (rawInspection.issues.length > 0) {
    throwIssues(rebaseIssues(rawInspection.issues, root));
  }
  const parsed = schema.safeParse(rawInspection.value);
  if (!parsed.success) {
    throwIssues(
      parsed.error.issues.map((item) =>
        issue("INVALID_DATA", item.message, [
          root,
          ...normalizeDocumentPath(item.path),
        ]),
      ),
    );
  }
  const outputInspection = inspectDocumentData(parsed.data);
  if (outputInspection.issues.length > 0) {
    throwIssues(rebaseIssues(outputInspection.issues, root));
  }
  return outputInspection.value;
}

function unique<TValue>(values: readonly TValue[]): boolean {
  return new Set(values).size === values.length;
}

function isStrictSchema(schema: z.ZodTypeAny): boolean {
  const definition = schema._def as unknown as Record<string, unknown>;
  if (definition.unknownKeys === "strict") return true;
  const inner = definition.schema;
  return inner instanceof z.ZodType && isStrictSchema(inner);
}

export function parseLocalImageId(
  value: unknown,
  path: readonly (number | string)[] = ["localImageId"],
): LocalImageId {
  const normalized = typeof value === "string" ? value.normalize("NFC") : value;
  const parsed = localImageIdSchema.safeParse(normalized);
  if (!parsed.success) {
    throwIssues(
      parsed.error.issues.map((item) =>
        issue("INVALID_DATA", item.message, [
          ...path,
          ...normalizeDocumentPath(item.path),
        ]),
      ),
    );
  }
  return parsed.data as LocalImageId;
}

export function defineTemplateDescriptor<
  TData extends JsonObject,
  TDescriptor extends TemplateDescriptor<TData> = TemplateDescriptor<TData>,
>(descriptor: TDescriptor): TDescriptor {
  const problems: DocumentIssue[] = [];
  const families: readonly TemplateFamily[] = [
    "badge",
    "business-card",
    "invoice",
    "receipt",
    "report",
    "resume",
  ];
  if (!isTemplateId(descriptor.id)) {
    problems.push(
      issue("INVALID_DATA", "Unknown canonical template ID.", [
        "descriptor",
        "id",
      ]),
    );
  }
  if (!descriptor.version || descriptor.version.length > 40) {
    problems.push(
      issue(
        "INVALID_DATA",
        "Template version must contain 1 to 40 characters.",
        ["descriptor", "version"],
      ),
    );
  }
  if (
    !Number.isInteger(descriptor.schemaVersion) ||
    descriptor.schemaVersion < 1
  ) {
    problems.push(
      issue("INVALID_DATA", "schemaVersion must be a positive integer.", [
        "descriptor",
        "schemaVersion",
      ]),
    );
  }
  if (!isStrictSchema(descriptor.schema)) {
    problems.push(
      issue(
        "INVALID_DATA",
        "Template data schema must use strict object validation.",
        ["descriptor", "schema"],
      ),
    );
  }
  if (!families.includes(descriptor.family)) {
    problems.push(
      issue("INVALID_DATA", "Descriptor contains an unknown family.", [
        "descriptor",
        "family",
      ]),
    );
  }
  const lists: ReadonlyArray<readonly unknown[]> = [
    descriptor.supportedFormatIds,
    descriptor.supportedThemeIds,
    descriptor.supportedLocales,
    descriptor.supportedPrintProfileKinds,
  ];
  if (lists.some((values) => values.length === 0 || !unique(values))) {
    problems.push(
      issue(
        "INVALID_DATA",
        "Supported-value lists must be non-empty and duplicate-free.",
        ["descriptor"],
      ),
    );
  }
  if (!descriptor.supportedFormatIds.every((id) => FORMAT_IDS.includes(id))) {
    problems.push(
      issue("INVALID_DATA", "Descriptor contains an unknown format.", [
        "descriptor",
        "supportedFormatIds",
      ]),
    );
  }
  if (!descriptor.supportedFormatIds.includes(descriptor.defaultFormatId)) {
    problems.push(
      issue(
        "UNSUPPORTED_FORMAT",
        "defaultFormatId must be supported by the template.",
        ["descriptor", "defaultFormatId"],
      ),
    );
  }
  if (descriptor.defaultFormatId === ("label-custom" as PresetFormatId)) {
    problems.push(
      issue(
        "UNSUPPORTED_FORMAT",
        "defaultFormatId cannot be label-custom because dimensions are required.",
        ["descriptor", "defaultFormatId"],
      ),
    );
  }
  if (!descriptor.supportedThemeIds.every((id) => THEME_IDS.includes(id))) {
    problems.push(
      issue("INVALID_DATA", "Descriptor contains an unknown theme.", [
        "descriptor",
        "supportedThemeIds",
      ]),
    );
  }
  if (!descriptor.supportedThemeIds.includes(descriptor.defaultThemeId)) {
    problems.push(
      issue(
        "INVALID_DATA",
        "defaultThemeId must be supported by the template.",
        ["descriptor", "defaultThemeId"],
      ),
    );
  }
  if (!descriptor.supportedLocales.includes(descriptor.defaultLocale)) {
    problems.push(
      issue(
        "INVALID_DATA",
        "defaultLocale must be supported by the template.",
        ["descriptor", "defaultLocale"],
      ),
    );
  }
  if (
    !descriptor.supportedLocales.every(
      (locale) => locale === "en" || locale === "fr",
    )
  ) {
    problems.push(
      issue("INVALID_DATA", "Descriptor contains an unknown locale.", [
        "descriptor",
        "supportedLocales",
      ]),
    );
  }
  if (
    !descriptor.supportedPrintProfileKinds.every(
      (kind) => kind === "screen" || kind === "print",
    )
  ) {
    problems.push(
      issue(
        "INVALID_DATA",
        "Descriptor contains an unknown print-profile kind.",
        ["descriptor", "supportedPrintProfileKinds"],
      ),
    );
  }
  try {
    resolvePrintProfile(descriptor.defaultPrintProfile);
  } catch (error) {
    if (!(error instanceof DocumentValidationError)) throw error;
    problems.push(
      ...error.issues.map((item) => ({
        ...item,
        path: ["descriptor", "defaultPrintProfile", ...item.path.slice(1)],
      })),
    );
  }
  if (
    !descriptor.supportedPrintProfileKinds.includes(
      descriptor.defaultPrintProfile.kind,
    )
  ) {
    problems.push(
      issue(
        "INVALID_DATA",
        "defaultPrintProfile kind must be supported by the template.",
        ["descriptor", "defaultPrintProfile"],
      ),
    );
  }
  for (const [role, families] of Object.entries(
    descriptor.themeCompatibility,
  )) {
    if (
      families &&
      (!unique(families) ||
        families.some((family) => !knownFontFamilies.has(family)))
    ) {
      problems.push(
        issue(
          "ASSET_REJECTED",
          `Theme compatibility for ${role} must contain unique manifest-qualified families.`,
          ["descriptor", "themeCompatibility", role],
        ),
      );
    }
  }
  if (problems.length > 0) throwIssues(problems);

  const defaultData = validateFixture(
    descriptor.schema,
    descriptor.defaultData,
    "defaultData",
  );
  const exampleData = validateFixture(
    descriptor.schema,
    descriptor.exampleData,
    "exampleData",
  );
  const registered = Object.freeze({
    ...descriptor,
    defaultData: deepFreeze(clone(defaultData)) as TData,
    exampleData: deepFreeze(clone(exampleData)) as TData,
    supportedFormatIds: Object.freeze([...descriptor.supportedFormatIds]),
    supportedLocales: Object.freeze([...descriptor.supportedLocales]),
    supportedPrintProfileKinds: Object.freeze([
      ...descriptor.supportedPrintProfileKinds,
    ]),
    defaultPrintProfile: deepFreeze(clone(descriptor.defaultPrintProfile)),
    supportedThemeIds: Object.freeze([...descriptor.supportedThemeIds]),
    themeCompatibility: Object.freeze({
      ...(descriptor.themeCompatibility.bodyFontFamilies
        ? {
            bodyFontFamilies: Object.freeze([
              ...descriptor.themeCompatibility.bodyFontFamilies,
            ]),
          }
        : {}),
      ...(descriptor.themeCompatibility.headingFontFamilies
        ? {
            headingFontFamilies: Object.freeze([
              ...descriptor.themeCompatibility.headingFontFamilies,
            ]),
          }
        : {}),
    }),
  });
  registeredDescriptors.add(registered);
  return registered as TDescriptor;
}

function selectedFontAssets(theme: PdfTheme) {
  const families = new Set([theme.fonts.body, theme.fonts.heading]);
  return assetManifest.assets
    .filter(
      (asset) =>
        families.has(asset.family) &&
        (asset.weight === theme.fonts.regularWeight ||
          asset.weight === theme.fonts.strongWeight),
    )
    .sort((left, right) => compareCodeUnits(left.id, right.id));
}

function fontManifestProjection(theme: PdfTheme) {
  return selectedFontAssets(theme).map((asset) => ({
    byteLength: asset.bytes,
    family: asset.family,
    format: asset.format,
    id: asset.id,
    sha256: asset.sha256,
    weight: asset.weight,
  }));
}

export async function createFontManifestIdentity(
  theme: PdfTheme,
): Promise<FontManifestIdentity> {
  const assets = selectedFontAssets(theme);
  const identity = deepFreeze({
    assetIds: assets.map((asset) => asset.id),
    schemaVersion: assetManifest.schemaVersion,
    sha256: canonicalSha256Sync({
      assets: fontManifestProjection(theme),
      schemaVersion: assetManifest.schemaVersion,
    }),
  }) as FontManifestIdentity;
  return identity;
}

function resolveTheme<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: ThemeInput | undefined,
): ResolvedTemplateTheme {
  let baseThemeId: ThemeId;
  let theme: PdfTheme;
  if (input === undefined || typeof input === "string") {
    const candidate = input ?? descriptor.defaultThemeId;
    if (!THEME_IDS.includes(candidate as ThemeId)) {
      throwIssues([
        issue("INVALID_DATA", `Unknown PDF theme "${candidate}".`, ["theme"]),
      ]);
    }
    baseThemeId = candidate as ThemeId;
    theme = clone(getCanonicalPdfTheme(baseThemeId));
  } else if (input !== null && "baseThemeId" in input) {
    const custom = validateCustomPdfTheme(input);
    baseThemeId = custom.baseThemeId;
    theme = clone(custom);
    delete (theme as PdfTheme & { baseThemeId?: ThemeId }).baseThemeId;
  } else {
    if (input === null) {
      throwIssues([
        issue("INVALID_DATA", "Theme must be a preset or theme object.", [
          "theme",
        ]),
      ]);
    }
    if (!isCanonicalPdfTheme(input)) {
      throwIssues([
        issue(
          "INVALID_DATA",
          "A bare PdfTheme must exactly match its canonical preset.",
          ["theme"],
        ),
      ]);
    }
    baseThemeId = input.id;
    theme = clone(getCanonicalPdfTheme(baseThemeId));
  }
  if (!descriptor.supportedThemeIds.includes(baseThemeId)) {
    throwIssues([
      issue(
        "INVALID_DATA",
        `Template "${descriptor.id}" does not support theme "${baseThemeId}".`,
        ["theme"],
      ),
    ]);
  }
  const base = getCanonicalPdfTheme(baseThemeId);
  for (const role of ["body", "heading"] as const) {
    if (theme.fonts[role] === base.fonts[role]) continue;
    const allowed = descriptor.themeCompatibility[`${role}FontFamilies`];
    if (!allowed?.includes(theme.fonts[role])) {
      throwIssues([
        issue(
          "ASSET_REJECTED",
          `Template "${descriptor.id}" has not qualified ${theme.fonts[role]} for the ${role} role.`,
          ["theme", "fonts", role],
        ),
      ]);
    }
  }
  return deepFreeze({ baseThemeId, theme: clone(theme) });
}

function normalizeFormat<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: FormatInput | undefined,
): ResolvedFormat {
  const selection: unknown = input ?? descriptor.defaultFormatId;
  let formatId: string;
  let options: unknown;
  if (typeof selection === "string") {
    if (selection === "label-custom") {
      throwIssues([
        issue(
          "UNSUPPORTED_FORMAT",
          "label-custom requires widthMm and heightMm.",
          ["format"],
        ),
      ]);
    }
    formatId = selection;
  } else if (selection !== null && typeof selection === "object") {
    const parsed = z
      .object({
        id: z.literal("label-custom"),
        widthMm: z.number().finite().positive(),
        heightMm: z.number().finite().positive(),
        orientation: z.enum(["landscape", "portrait"]).optional(),
      })
      .strict()
      .safeParse(selection);
    if (!parsed.success) {
      throwIssues(
        parsed.error.issues.map((item) =>
          issue("UNSUPPORTED_FORMAT", item.message, [
            "format",
            ...normalizeDocumentPath(item.path),
          ]),
        ),
      );
    }
    formatId = parsed.data.id;
    options = {
      widthMm: parsed.data.widthMm,
      heightMm: parsed.data.heightMm,
      ...(parsed.data.orientation
        ? { orientation: parsed.data.orientation }
        : {}),
    };
  } else {
    throwIssues([
      issue(
        "UNSUPPORTED_FORMAT",
        "Format must be a preset ID or custom-label object.",
        ["format"],
      ),
    ]);
  }
  if (!descriptor.supportedFormatIds.includes(formatId as FormatId)) {
    throwIssues([
      issue(
        "UNSUPPORTED_FORMAT",
        `Template "${descriptor.id}" does not support format "${formatId}".`,
        ["format"],
      ),
    ]);
  }
  try {
    return resolveFormat(formatId, options);
  } catch (error) {
    if (!(error instanceof DocumentValidationError)) throw error;
    throwIssues(
      error.issues.map((item) => ({
        ...item,
        path: ["format", ...item.path.slice(1)],
      })),
    );
  }
}

function extractLocalImageIds<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  data: TData,
): readonly LocalImageId[] {
  const imageIds = [
    ...new Set(
      descriptor
        .extractLocalImageIds(data)
        .map((id, index) =>
          parseLocalImageId(id, ["data", "localImageIds", index]),
        ),
    ),
  ].sort(compareCodeUnits);
  if (imageIds.length > DOCUMENT_LIMITS.permittedAssets) {
    throwIssues([
      issue(
        "LIMIT_EXCEEDED",
        `A template may use at most ${DOCUMENT_LIMITS.permittedAssets} local images.`,
        ["data", "localImageIds"],
      ),
    ]);
  }
  return imageIds;
}

function normalizeImages(
  imageIds: readonly LocalImageId[],
  supplied: readonly LocalImageDescriptor[],
): readonly LocalImageDescriptor[] {
  const descriptors = supplied.map((value, index) => {
    const parsed = localImageDescriptorSchema.safeParse(value);
    if (!parsed.success) {
      throwIssues(
        parsed.error.issues.map((item) =>
          issue("ASSET_REJECTED", item.message, [
            "localImageDescriptors",
            index,
            ...normalizeDocumentPath(item.path),
          ]),
        ),
      );
    }
    if (
      parsed.data.widthPx * parsed.data.heightPx >
      DOCUMENT_LIMITS.imagePixels
    ) {
      throwIssues([
        issue(
          "LIMIT_EXCEEDED",
          `Local image exceeds ${DOCUMENT_LIMITS.imagePixels} pixels.`,
          ["localImageDescriptors", index],
        ),
      ]);
    }
    return {
      ...parsed.data,
      id: parseLocalImageId(parsed.data.id, [
        "localImageDescriptors",
        index,
        "id",
      ]),
    } as LocalImageDescriptor;
  });
  const descriptorIds = descriptors.map(({ id }) => id);
  if (!unique(descriptorIds)) {
    throwIssues([
      issue("ASSET_REJECTED", "Local image descriptors must have unique IDs.", [
        "localImageDescriptors",
      ]),
    ]);
  }
  const sorted = descriptors.sort((left, right) =>
    compareCodeUnits(left.id, right.id),
  );
  if (
    imageIds.length !== sorted.length ||
    imageIds.some((id, index) => id !== sorted[index]?.id)
  ) {
    throwIssues([
      issue(
        "ASSET_REJECTED",
        "Local image descriptors must exactly match the image IDs used by validated data.",
        ["localImageDescriptors"],
      ),
    ]);
  }
  return sorted;
}

function validateManifestIdentity(
  identity: FontManifestIdentity,
  theme: PdfTheme,
): FontManifestIdentity {
  const parsed = fontManifestIdentitySchema.safeParse(identity);
  if (!parsed.success) {
    throwIssues(
      parsed.error.issues.map((item) =>
        issue("ASSET_REJECTED", item.message, [
          "fontManifestIdentity",
          ...normalizeDocumentPath(item.path),
        ]),
      ),
    );
  }
  const validatedIdentity = parsed.data as FontManifestIdentity;
  const expectedIds = selectedFontAssets(theme).map((asset) => asset.id);
  const expectedSha256 = canonicalSha256Sync({
    assets: fontManifestProjection(theme),
    schemaVersion: assetManifest.schemaVersion,
  });
  if (
    validatedIdentity.schemaVersion !== assetManifest.schemaVersion ||
    validatedIdentity.assetIds.length !== expectedIds.length ||
    validatedIdentity.assetIds.some((id, index) => id !== expectedIds[index]) ||
    validatedIdentity.sha256 !== expectedSha256
  ) {
    throwIssues([
      issue(
        "ASSET_REJECTED",
        "Font manifest identity does not match the resolved theme.",
        ["fontManifestIdentity"],
      ),
    ]);
  }
  return validatedIdentity;
}

interface PreparedTemplateNormalization<TData extends JsonObject> {
  readonly data: TData;
  readonly format: ResolvedFormat;
  readonly imageIds: readonly LocalImageId[];
  readonly locale: DocumentLocale;
  readonly printProfile: PrintProfile;
  readonly revision: number;
  readonly theme: ResolvedTemplateTheme;
  readonly themeWasExplicit: boolean;
}

function prepareTemplateNormalization<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: TemplateRenderInput<TData>,
): PreparedTemplateNormalization<TData> {
  if (!registeredDescriptors.has(descriptor as object)) {
    throwIssues([
      issue(
        "INVALID_DATA",
        "Template descriptor must be registered with defineTemplateDescriptor.",
        ["template"],
      ),
    ]);
  }
  const parsedInput = templateRenderInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throwIssues(
      parsedInput.error.issues.flatMap((item) =>
        item.code === "unrecognized_keys"
          ? item.keys.map((key) =>
              issue("INVALID_DATA", `Unknown template input field "${key}".`, [
                key,
              ]),
            )
          : [
              issue(
                "INVALID_DATA",
                item.message,
                normalizeDocumentPath(item.path),
              ),
            ],
      ),
    );
  }
  if (!("data" in parsedInput.data)) {
    throwIssues([
      issue("INVALID_DATA", "Template data is required.", ["data"]),
    ]);
  }
  const validatedInput = parsedInput.data as TemplateRenderInput<TData>;
  const data = deepFreeze(
    clone(validateFixture(descriptor.schema, validatedInput.data, "data")),
  ) as TData;
  const theme = resolveTheme(descriptor, validatedInput.theme);
  const format = normalizeFormat(descriptor, validatedInput.format);
  const locale = validatedInput.locale ?? descriptor.defaultLocale;
  if (!descriptor.supportedLocales.includes(locale)) {
    throwIssues([
      issue(
        "INVALID_DATA",
        `Template "${descriptor.id}" does not support locale "${locale}".`,
        ["locale"],
      ),
    ]);
  }
  const printProfile = resolvePrintProfile(
    validatedInput.printProfile ?? descriptor.defaultPrintProfile,
  );
  if (!descriptor.supportedPrintProfileKinds.includes(printProfile.kind)) {
    throwIssues([
      issue(
        "UNSUPPORTED_FORMAT",
        `Template "${descriptor.id}" does not support the "${printProfile.kind}" print profile.`,
        ["printProfile"],
      ),
    ]);
  }
  if (format.kind === "continuous" && printProfile.kind !== "screen") {
    throwIssues([
      issue(
        "UNSUPPORTED_FORMAT",
        "Continuous formats support only the screen print profile.",
        ["printProfile"],
      ),
    ]);
  }
  const revision = validatedInput.revision ?? 1;
  if (!Number.isInteger(revision) || revision < 1) {
    throwIssues([
      issue("INVALID_DATA", "revision must be a positive integer.", [
        "revision",
      ]),
    ]);
  }
  const imageIds = Object.freeze([...extractLocalImageIds(descriptor, data)]);
  return Object.freeze({
    data,
    format,
    imageIds,
    locale,
    printProfile,
    revision,
    theme,
    themeWasExplicit: validatedInput.theme !== undefined,
  });
}

function completeTemplateNormalization<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  prepared: PreparedTemplateNormalization<TData>,
  context: NormalizationContext,
): NormalizedTemplateInput<TData> {
  const images = normalizeImages(
    prepared.imageIds,
    context.localImageDescriptors,
  );
  const manifestIdentity = validateManifestIdentity(
    context.fontManifestIdentity,
    prepared.theme.theme as PdfTheme,
  );
  return deepFreeze({
    data: prepared.data,
    fontManifestIdentity: clone(manifestIdentity),
    format: clone(prepared.format),
    localImageDescriptors: clone(images),
    locale: prepared.locale,
    printProfile: clone(prepared.printProfile),
    revision: prepared.revision,
    schemaVersion: descriptor.schemaVersion,
    templateId: descriptor.id,
    templateVersion: descriptor.version,
    theme: clone(prepared.theme),
  }) as NormalizedTemplateInput<TData>;
}

export function normalizeTemplateInput<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: TemplateRenderInput<TData>,
  context: NormalizationContext,
): NormalizedTemplateInput<TData> {
  return completeTemplateNormalization(
    descriptor,
    prepareTemplateNormalization(descriptor, input),
    context,
  );
}

/** @internal Runtime orchestration hook; use normalizeTemplateInput publicly. */
export async function normalizeTemplateInputForRender<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: TemplateRenderInput<TData>,
  createContext: (prepared: {
    readonly imageIds: readonly LocalImageId[];
    readonly resolvedTheme: ResolvedTemplateTheme;
  }) => Promise<NormalizationContext>,
): Promise<{
  readonly normalized: NormalizedTemplateInput<TData>;
  readonly themeWasExplicit: boolean;
}> {
  const prepared = prepareTemplateNormalization(descriptor, input);
  const context = await createContext({
    imageIds: prepared.imageIds,
    resolvedTheme: prepared.theme,
  });
  return {
    normalized: completeTemplateNormalization(descriptor, prepared, context),
    themeWasExplicit: prepared.themeWasExplicit,
  };
}

export async function fingerprintNormalizedTemplateInput<
  TData extends JsonObject,
>(input: NormalizedTemplateInput<TData>): Promise<`sha256:${string}`> {
  return sha256(input);
}
