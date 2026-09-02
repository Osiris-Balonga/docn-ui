import { z } from "zod";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentIssue,
} from "./errors";
import {
  resolveFormat,
  resolvePrintProfile,
  type FormatId,
  type FixedFormatOptions,
  type PrintProfile,
  type ResolvedFormat,
} from "./formats";
import type { PhysicalDimensions } from "./units";

export const PDF_RENDER_PROTOCOL_VERSION = 1 as const;
export const THEME_IDS = ["neutral", "editorial", "bold"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type DocumentLocale = "en" | "fr";
export const PDF_ACCENT_COLORS = [
  "#3f5f73",
  "#9a4f35",
  "#5a35d6",
  "#0f766e",
] as const;
export type PdfAccentColor = (typeof PDF_ACCENT_COLORS)[number];

export interface DocumentOverrides {
  accentColor?: PdfAccentColor | undefined;
}

export const DOCUMENT_LIMITS = {
  dataBytes: 256 * 1024,
  dataDepth: 8,
  finalPdfBytes: 20 * 1024 * 1024,
  generalStringCharacters: 2_000,
  generationMilliseconds: 15_000,
  imageBytes: 5 * 1024 * 1024,
  imagePixels: 16_000_000,
  pages: 50,
  permittedAssets: 2,
} as const;

export interface RenderRequest<TData = unknown> {
  assetIds: readonly string[];
  data: TData;
  formatId: FormatId;
  formatOptions?: FixedFormatOptions;
  locale: DocumentLocale;
  overrides?: DocumentOverrides;
  printProfile: PrintProfile;
  protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION;
  revision: number;
  templateId: string;
  templateVersion: string;
  themeId: ThemeId;
}

export interface RenderDiagnostic {
  code: string;
  message: string;
  path?: readonly (number | string)[];
}

export interface RenderResult {
  diagnostics: readonly RenderDiagnostic[];
  finalDimensions: readonly PhysicalDimensions[];
  fingerprint: string;
  pageCount: number;
  pdfBytes: Uint8Array;
  revision: number;
}

export interface TemplateMetadata {
  family: "business-card" | "invoice" | "label" | "receipt" | "ticket";
  id: string;
  schemaVersion: number;
  supportedFormatIds: readonly FormatId[];
  supportedThemeIds: readonly ThemeId[];
  version: string;
}

export type TemplateRenderFunction<TData, TOutput> = (context: {
  data: TData;
  format: ResolvedFormat;
  locale: DocumentLocale;
  overrides: DocumentOverrides;
  printProfile: PrintProfile;
  themeId: ThemeId;
}) => TOutput;

export interface RenderCompatibility {
  supportedFormatIds: readonly FormatId[];
  supportedThemeIds: readonly ThemeId[];
}

export interface DocumentDataInspection<TData = unknown> {
  issues: readonly DocumentIssue[];
  value: TData;
}

export interface ValidatedRenderRequest<TData = unknown> {
  format: ResolvedFormat;
  request: RenderRequest<TData>;
}

const identifier = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a stable kebab-case identifier.");

const renderRequestSchema = z
  .object({
    protocolVersion: z.literal(PDF_RENDER_PROTOCOL_VERSION),
    revision: z.number().int().positive(),
    templateId: identifier,
    templateVersion: z.string().min(1).max(40),
    data: z.unknown(),
    formatId: z.string().min(1),
    formatOptions: z.unknown().optional(),
    themeId: z.enum(THEME_IDS),
    locale: z.enum(["en", "fr"]),
    overrides: z
      .object({ accentColor: z.enum(PDF_ACCENT_COLORS).optional() })
      .strict()
      .default({}),
    printProfile: z.unknown(),
    assetIds: z
      .array(identifier)
      .max(DOCUMENT_LIMITS.permittedAssets)
      .default([]),
  })
  .strict();

function inspectValue(
  value: unknown,
  path: readonly (number | string)[],
  depth: number,
  issues: DocumentIssue[],
  ancestors: Set<object>,
): unknown {
  if (depth > DOCUMENT_LIMITS.dataDepth) {
    issues.push({
      code: "LIMIT_EXCEEDED",
      message: `Document data exceeds the maximum depth of ${DOCUMENT_LIMITS.dataDepth}.`,
      path,
    });
    return value;
  }
  if (typeof value === "string") {
    if (value.length > DOCUMENT_LIMITS.generalStringCharacters) {
      issues.push({
        code: "LIMIT_EXCEEDED",
        message: `String exceeds ${DOCUMENT_LIMITS.generalStringCharacters} characters.`,
        path,
      });
    }
    return value.normalize("NFC");
  }
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      issues.push({
        code: "INVALID_DATA",
        message: "Document numbers must be finite.",
        path,
      });
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) {
      issues.push({
        code: "INVALID_DATA",
        message: "Document data cannot be cyclic.",
        path,
      });
      return value;
    }
    ancestors.add(value);
    const normalized = value.map((item, index) =>
      inspectValue(item, [...path, index], depth + 1, issues, ancestors),
    );
    ancestors.delete(value);
    return normalized;
  }
  if (typeof value === "object") {
    if (ancestors.has(value)) {
      issues.push({
        code: "INVALID_DATA",
        message: "Document data cannot be cyclic.",
        path,
      });
      return value;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      issues.push({
        code: "INVALID_DATA",
        message: "Document data must contain only JSON objects.",
        path,
      });
      return value;
    }
    ancestors.add(value);
    const normalized = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        inspectValue(item, [...path, key], depth + 1, issues, ancestors),
      ]),
    );
    ancestors.delete(value);
    return normalized;
  }
  issues.push({
    code: "INVALID_DATA",
    message: "Document data must be JSON-serializable.",
    path,
  });
  return value;
}

export function inspectDocumentData<TData>(
  data: TData,
): DocumentDataInspection<TData> {
  const issues: DocumentIssue[] = [];
  const value = inspectValue(data, ["data"], 0, issues, new Set()) as TData;
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      issues.push({
        code: "INVALID_DATA",
        message: "Document data must have a JSON representation.",
        path: ["data"],
      });
    } else if (
      new TextEncoder().encode(serialized).byteLength >
      DOCUMENT_LIMITS.dataBytes
    ) {
      issues.push({
        code: "LIMIT_EXCEEDED",
        message: `Document data exceeds ${DOCUMENT_LIMITS.dataBytes} UTF-8 bytes.`,
        path: ["data"],
      });
    }
  } catch {
    if (!issues.some((issue) => issue.path.length === 1)) {
      issues.push({
        code: "INVALID_DATA",
        message: "Document data must be JSON-serializable.",
        path: ["data"],
      });
    }
  }
  return { value, issues };
}

export function validateRenderRequest<TData>(
  input: unknown,
  compatibility: RenderCompatibility,
): ValidatedRenderRequest<TData> {
  const parsed = renderRequestSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue): DocumentIssue => ({
      code: "INVALID_DATA" as const,
      message: issue.message,
      path: normalizeDocumentPath(issue.path),
    }));
    const [first, ...rest] = issues;
    if (!first)
      throw new Error("Zod returned an unsuccessful result without issues.");
    throw new DocumentValidationError([first, ...rest]);
  }

  const request = parsed.data;
  if (
    !compatibility.supportedFormatIds.includes(request.formatId as FormatId)
  ) {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: `Template "${request.templateId}" does not support format "${request.formatId}".`,
        path: ["formatId"],
      },
    ]);
  }
  if (!compatibility.supportedThemeIds.includes(request.themeId)) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: `Template "${request.templateId}" does not support theme "${request.themeId}".`,
        path: ["themeId"],
      },
    ]);
  }

  const format = resolveFormat(request.formatId, request.formatOptions);
  const printProfile = resolvePrintProfile(request.printProfile);
  const inspection = inspectDocumentData(request.data);
  if (inspection.issues.length > 0) {
    throw new DocumentValidationError(
      inspection.issues as [DocumentIssue, ...DocumentIssue[]],
    );
  }

  const { formatOptions, ...requestWithoutFormatOptions } = request;
  return {
    format,
    request: {
      ...requestWithoutFormatOptions,
      data: inspection.value as TData,
      formatId: request.formatId as FormatId,
      printProfile,
      ...(formatOptions === undefined
        ? {}
        : { formatOptions: formatOptions as FixedFormatOptions }),
    },
  };
}
