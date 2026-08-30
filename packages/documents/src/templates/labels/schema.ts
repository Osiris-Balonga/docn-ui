import { z } from "zod";
import { LABEL_EXPORT_LIMIT } from "../../core/imposition";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentIssue,
} from "../../core/errors";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

export const labelContentSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    title: z.string().trim().min(1).max(120),
    subtitle: optionalText(120),
    reference: optionalText(80),
    lines: z.array(z.string().trim().min(1).max(120)).max(4).default([]),
    qrPayload: optionalText(512),
    logoAssetId: optionalText(120),
  })
  .strict();

const individualExportSchema = z
  .object({ mode: z.literal("individual") })
  .strict();

const sheetExportSchema = z
  .object({
    mode: z.literal("sheet"),
    pageFormatId: z.enum(["a4", "letter"]),
    marginsMm: z
      .object({
        top: z.number().finite().nonnegative(),
        right: z.number().finite().nonnegative(),
        bottom: z.number().finite().nonnegative(),
        left: z.number().finite().nonnegative(),
      })
      .strict(),
    columnGapMm: z.number().finite().nonnegative(),
    rowGapMm: z.number().finite().nonnegative(),
    startingCell: z.number().int().nonnegative(),
    quantity: z.number().int().min(1).max(LABEL_EXPORT_LIMIT),
  })
  .strict();

export const labelDataSchema = z
  .object({
    labels: z.array(labelContentSchema).min(1).max(LABEL_EXPORT_LIMIT),
    export: z.discriminatedUnion("mode", [
      individualExportSchema,
      sheetExportSchema,
    ]),
  })
  .strict()
  .superRefine((data, context) => {
    const ids = new Set<string>();
    data.labels.forEach((label, index) => {
      if (ids.has(label.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Label identifiers must be unique and remain in export order.",
          path: ["labels", index, "id"],
        });
      }
      ids.add(label.id);
    });
    if (
      data.export.mode === "sheet" &&
      data.labels.length > 1 &&
      data.export.quantity > data.labels.length
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "A multi-label sheet quantity cannot exceed the ordered label list.",
        path: ["export", "quantity"],
      });
    }
  });

export type LabelContent = z.infer<typeof labelContentSchema>;
export type LabelData = z.infer<typeof labelDataSchema>;

export function parseLabelData(input: unknown): LabelData {
  const parsed = labelDataSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.issues.map((item): DocumentIssue => ({
    code:
      item.code === z.ZodIssueCode.too_big ? "LIMIT_EXCEEDED" : "INVALID_DATA",
    message: item.message,
    path: ["data", ...normalizeDocumentPath(item.path)],
  }));
  const [first, ...rest] = issues;
  if (!first) throw new Error("Label validation failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}
