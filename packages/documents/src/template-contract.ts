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

const knownFontFamilies = new Set(
  assetManifest.assets.map((asset) => asset.family),
);
const issuedFontManifestIdentities = new WeakSet<object>();
const registeredDescriptors = new WeakSet<object>();

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
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
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

export function defineTemplateDescriptor<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
): TemplateDescriptor<TData> {
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
  return registered;
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
    .sort((left, right) => left.id.localeCompare(right.id));
}

export async function createFontManifestIdentity(
  theme: PdfTheme,
): Promise<FontManifestIdentity> {
  const assets = selectedFontAssets(theme);
  const projection = assets.map((asset) => ({
    byteLength: asset.bytes,
    family: asset.family,
    format: asset.format,
    id: asset.id,
    sha256: asset.sha256,
    weight: asset.weight,
  }));
  const identity = deepFreeze({
    assetIds: assets.map((asset) => asset.id),
    schemaVersion: assetManifest.schemaVersion,
    sha256: await sha256({
      assets: projection,
      schemaVersion: assetManifest.schemaVersion,
    }),
  }) as FontManifestIdentity;
  issuedFontManifestIdentities.add(identity);
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

function normalizeImages<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  data: TData,
  supplied: readonly LocalImageDescriptor[],
): readonly LocalImageDescriptor[] {
  const imageIds = [
    ...new Set(
      descriptor
        .extractLocalImageIds(data)
        .map((id, index) =>
          parseLocalImageId(id, ["data", "localImageIds", index]),
        ),
    ),
  ].sort((left, right) => left.localeCompare(right));
  if (imageIds.length > DOCUMENT_LIMITS.permittedAssets) {
    throwIssues([
      issue(
        "LIMIT_EXCEEDED",
        `A template may use at most ${DOCUMENT_LIMITS.permittedAssets} local images.`,
        ["data", "localImageIds"],
      ),
    ]);
  }
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
    left.id.localeCompare(right.id),
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
  if (!issuedFontManifestIdentities.has(identity as object)) {
    throwIssues([
      issue(
        "ASSET_REJECTED",
        "Font manifest identity must be created from the bundled manifest.",
        ["fontManifestIdentity"],
      ),
    ]);
  }
  const expectedIds = selectedFontAssets(theme).map((asset) => asset.id);
  if (
    identity.schemaVersion !== assetManifest.schemaVersion ||
    identity.assetIds.length !== expectedIds.length ||
    identity.assetIds.some((id, index) => id !== expectedIds[index])
  ) {
    throwIssues([
      issue(
        "ASSET_REJECTED",
        "Font manifest identity does not match the resolved theme.",
        ["fontManifestIdentity"],
      ),
    ]);
  }
  return identity;
}

export function normalizeTemplateInput<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: TemplateRenderInput<TData>,
  context: NormalizationContext,
): NormalizedTemplateInput<TData> {
  if (!registeredDescriptors.has(descriptor as object)) {
    throwIssues([
      issue(
        "INVALID_DATA",
        "Template descriptor must be registered with defineTemplateDescriptor.",
        ["template"],
      ),
    ]);
  }
  if (!input || typeof input !== "object" || !("data" in input)) {
    throwIssues([
      issue("INVALID_DATA", "Template data is required.", ["data"]),
    ]);
  }
  const data = validateFixture(descriptor.schema, input.data, "data");
  const theme = resolveTheme(descriptor, input.theme);
  const format = normalizeFormat(descriptor, input.format);
  const locale = input.locale ?? descriptor.defaultLocale;
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
    input.printProfile ?? descriptor.defaultPrintProfile,
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
  const revision = input.revision ?? 1;
  if (!Number.isInteger(revision) || revision < 1) {
    throwIssues([
      issue("INVALID_DATA", "revision must be a positive integer.", [
        "revision",
      ]),
    ]);
  }
  const images = normalizeImages(
    descriptor,
    data,
    context.localImageDescriptors,
  );
  const manifestIdentity = validateManifestIdentity(
    context.fontManifestIdentity,
    theme.theme as PdfTheme,
  );
  return deepFreeze({
    data: clone(data),
    fontManifestIdentity: clone(manifestIdentity),
    format: clone(format),
    localImageDescriptors: clone(images),
    locale,
    printProfile: clone(printProfile),
    revision,
    schemaVersion: descriptor.schemaVersion,
    templateId: descriptor.id,
    templateVersion: descriptor.version,
    theme: clone(theme),
  }) as NormalizedTemplateInput<TData>;
}

export async function fingerprintNormalizedTemplateInput<
  TData extends JsonObject,
>(input: NormalizedTemplateInput<TData>): Promise<`sha256:${string}`> {
  return sha256(input);
}
