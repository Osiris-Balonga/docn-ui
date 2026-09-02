import { z } from "zod";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentIssue,
} from "./errors";
import {
  millimetersToPoints,
  toPhysicalDimensions,
  type PhysicalDimensions,
} from "./units";

export const FORMAT_IDS = [
  "card-85x55",
  "card-90x50",
  "card-us",
  "badge-54x86",
  "ticket-210x74",
  "ticket-150x70",
  "ticket-a6",
  "receipt-58",
  "receipt-80",
  "label-70x37",
  "label-100x50",
  "label-custom",
  "a4",
  "letter",
] as const;

export type FormatId = (typeof FORMAT_IDS)[number];
export type Orientation = "landscape" | "portrait";

interface FixedFormatDefinition {
  allowedOrientations: readonly Orientation[];
  defaultOrientation: Orientation;
  heightMm: number;
  id: Exclude<FormatId, "label-custom" | "receipt-58" | "receipt-80">;
  kind: "fixed";
  safeAreaMm: number;
  widthMm: number;
}

interface CustomLabelFormatDefinition {
  allowedOrientations: readonly Orientation[];
  defaultOrientation: Orientation;
  heightRangeMm: readonly [number, number];
  id: "label-custom";
  kind: "custom-fixed";
  safeAreaMm: number;
  widthRangeMm: readonly [number, number];
}

interface ContinuousFormatDefinition {
  id: "receipt-58" | "receipt-80";
  kind: "continuous";
  maxHeightMm: number;
  safeAreaMm: number;
  widthMm: 58 | 80;
}

export type FormatDefinition =
  | ContinuousFormatDefinition
  | CustomLabelFormatDefinition
  | FixedFormatDefinition;

const landscapeOnly = ["landscape"] as const;
const portraitOnly = ["portrait"] as const;
const bothOrientations = ["landscape", "portrait"] as const;

export const formats = {
  "card-85x55": fixed("card-85x55", 85, 55, landscapeOnly, 3),
  "card-90x50": fixed("card-90x50", 90, 50, landscapeOnly, 3),
  "card-us": fixed("card-us", 88.9, 50.8, landscapeOnly, 3),
  "badge-54x86": fixed("badge-54x86", 53.98, 85.6, portraitOnly, 3),
  "ticket-210x74": fixed("ticket-210x74", 210, 74, landscapeOnly, 5),
  "ticket-150x70": fixed("ticket-150x70", 150, 70, landscapeOnly, 5),
  "ticket-a6": fixed("ticket-a6", 105, 148, portraitOnly, 6),
  "receipt-58": continuous("receipt-58", 58),
  "receipt-80": continuous("receipt-80", 80),
  "label-70x37": fixed("label-70x37", 70, 37, bothOrientations, 3),
  "label-100x50": fixed("label-100x50", 100, 50, bothOrientations, 4),
  "label-custom": {
    id: "label-custom",
    kind: "custom-fixed",
    widthRangeMm: [40, 120],
    heightRangeMm: [25, 100],
    defaultOrientation: "landscape",
    allowedOrientations: bothOrientations,
    safeAreaMm: 3,
  },
  a4: fixed("a4", 210, 297, portraitOnly, 10),
  letter: fixed("letter", 215.9, 279.4, portraitOnly, 10),
} as const satisfies Record<FormatId, FormatDefinition>;

export interface FixedFormatOptions {
  heightMm?: number;
  orientation?: Orientation;
  widthMm?: number;
}

export interface ResolvedFixedFormat {
  id: Exclude<FormatId, "receipt-58" | "receipt-80">;
  kind: "fixed";
  orientation: Orientation;
  safeAreaMm: number;
  trim: PhysicalDimensions;
}

export interface ResolvedContinuousFormat {
  id: "receipt-58" | "receipt-80";
  kind: "continuous";
  maxHeightMm: number;
  maxHeightPt: number;
  safeAreaMm: number;
  widthMm: number;
  widthPt: number;
}

export type ResolvedFormat = ResolvedContinuousFormat | ResolvedFixedFormat;

export type PrintProfile =
  { kind: "screen" } | { bleedMm: 0 | 3; cropMarks: boolean; kind: "print" };

const fixedOptionsSchema = z
  .object({
    orientation: z.enum(["landscape", "portrait"]).optional(),
    widthMm: z.number().finite().positive().optional(),
    heightMm: z.number().finite().positive().optional(),
  })
  .strict();

const printProfileSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("screen") }).strict(),
  z
    .object({
      kind: z.literal("print"),
      bleedMm: z.union([z.literal(0), z.literal(3)]),
      cropMarks: z.boolean(),
    })
    .strict(),
]);

function fixed<
  TId extends Exclude<FormatId, "label-custom" | "receipt-58" | "receipt-80">,
>(
  id: TId,
  widthMm: number,
  heightMm: number,
  allowedOrientations: readonly Orientation[],
  safeAreaMm: number,
): FixedFormatDefinition & { id: TId } {
  const defaultOrientation = widthMm >= heightMm ? "landscape" : "portrait";
  return {
    id,
    kind: "fixed",
    widthMm,
    heightMm,
    defaultOrientation,
    allowedOrientations,
    safeAreaMm,
  };
}

function continuous<TId extends "receipt-58" | "receipt-80">(
  id: TId,
  widthMm: 58 | 80,
): ContinuousFormatDefinition & { id: TId } {
  return {
    id,
    kind: "continuous",
    widthMm,
    maxHeightMm: 2_000,
    safeAreaMm: 4,
  };
}

function validationIssue(
  message: string,
  path: readonly (number | string)[],
  code: DocumentIssue["code"] = "UNSUPPORTED_FORMAT",
): DocumentIssue {
  return { code, message, path };
}

function throwSchemaIssues(
  error: z.ZodError,
  root: string,
  code: DocumentIssue["code"],
): never {
  const issues = error.issues.map((issue) =>
    validationIssue(
      issue.message,
      [root, ...normalizeDocumentPath(issue.path)],
      code,
    ),
  );
  const [first, ...rest] = issues;
  if (!first)
    throw new Error("Zod returned an unsuccessful result without issues.");
  throw new DocumentValidationError([first, ...rest]);
}

function orientOnce(
  widthMm: number,
  heightMm: number,
  orientation: Orientation,
): PhysicalDimensions {
  const alreadyOriented =
    orientation === "landscape" ? widthMm >= heightMm : heightMm >= widthMm;
  return alreadyOriented
    ? toPhysicalDimensions(widthMm, heightMm)
    : toPhysicalDimensions(heightMm, widthMm);
}

export function resolveFormat(
  formatId: string,
  rawOptions?: unknown,
): ResolvedFormat {
  if (!(formatId in formats)) {
    throw new DocumentValidationError([
      validationIssue(`Unknown format "${formatId}".`, ["formatId"]),
    ]);
  }
  const definition = formats[formatId as FormatId] as FormatDefinition;
  if (definition.kind === "continuous") {
    if (rawOptions !== undefined) {
      throw new DocumentValidationError([
        validationIssue(
          "Continuous formats do not accept orientation or fixed dimensions.",
          ["formatOptions"],
        ),
      ]);
    }
    return {
      id: definition.id,
      kind: "continuous",
      widthMm: definition.widthMm,
      widthPt: millimetersToPoints(definition.widthMm),
      maxHeightMm: definition.maxHeightMm,
      maxHeightPt: millimetersToPoints(definition.maxHeightMm),
      safeAreaMm: definition.safeAreaMm,
    };
  }

  const parsed = fixedOptionsSchema.safeParse(rawOptions ?? {});
  if (!parsed.success) {
    throwSchemaIssues(parsed.error, "formatOptions", "UNSUPPORTED_FORMAT");
  }
  const options = parsed.data;
  const orientation = options.orientation ?? definition.defaultOrientation;
  if (!definition.allowedOrientations.includes(orientation)) {
    throw new DocumentValidationError([
      validationIssue(
        `Format "${formatId}" does not support ${orientation} orientation.`,
        ["formatOptions", "orientation"],
      ),
    ]);
  }

  let widthMm: number;
  let heightMm: number;
  if (definition.kind === "custom-fixed") {
    if (options.widthMm === undefined || options.heightMm === undefined) {
      throw new DocumentValidationError([
        validationIssue("Custom labels require widthMm and heightMm.", [
          "formatOptions",
        ]),
      ]);
    }
    widthMm = options.widthMm;
    heightMm = options.heightMm;
    const issues: DocumentIssue[] = [];
    if (
      widthMm < definition.widthRangeMm[0] ||
      widthMm > definition.widthRangeMm[1]
    ) {
      issues.push(
        validationIssue(
          `Custom label width must be between ${definition.widthRangeMm[0]} and ${definition.widthRangeMm[1]} mm.`,
          ["formatOptions", "widthMm"],
        ),
      );
    }
    if (
      heightMm < definition.heightRangeMm[0] ||
      heightMm > definition.heightRangeMm[1]
    ) {
      issues.push(
        validationIssue(
          `Custom label height must be between ${definition.heightRangeMm[0]} and ${definition.heightRangeMm[1]} mm.`,
          ["formatOptions", "heightMm"],
        ),
      );
    }
    if (issues.length > 0) {
      throw new DocumentValidationError(
        issues as [DocumentIssue, ...DocumentIssue[]],
      );
    }
  } else {
    if (options.widthMm !== undefined || options.heightMm !== undefined) {
      throw new DocumentValidationError([
        validationIssue("Preset dimensions cannot be overridden.", [
          "formatOptions",
        ]),
      ]);
    }
    widthMm = definition.widthMm;
    heightMm = definition.heightMm;
  }

  return {
    id: definition.id,
    kind: "fixed",
    orientation,
    safeAreaMm: definition.safeAreaMm,
    trim: orientOnce(widthMm, heightMm, orientation),
  };
}

export function resolvePrintProfile(value: unknown): PrintProfile {
  const parsed = printProfileSchema.safeParse(value);
  if (!parsed.success) {
    throwSchemaIssues(parsed.error, "printProfile", "INVALID_DATA");
  }
  return parsed.data;
}
