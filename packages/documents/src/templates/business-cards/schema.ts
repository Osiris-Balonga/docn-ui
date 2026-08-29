import { z } from "zod";
import {
  DocumentValidationError,
  normalizeDocumentPath,
} from "../../core/errors";

function optionalText(schema: z.ZodString) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional(),
  );
}

export const businessCardDataSchema = z
  .object({
    name: z.string().trim().min(1).max(48),
    role: optionalText(z.string().trim().min(1).max(60)),
    organization: optionalText(z.string().trim().min(1).max(80)),
    email: optionalText(z.string().trim().email().max(120)),
    phone: optionalText(
      z
        .string()
        .trim()
        .min(5)
        .max(40)
        .regex(/^[+()\d .-]+$/, "Use a valid international phone number."),
    ),
    website: optionalText(z.string().trim().url().max(160)),
    address: optionalText(z.string().trim().min(1).max(120)),
    logoAssetId: optionalText(
      z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(120),
    ),
    qrPayload: optionalText(z.string().trim().min(1).max(512)),
  })
  .strict()
  .superRefine((data, context) => {
    if (!data.email && !data.phone && !data.website && !data.address) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one contact detail.",
        path: ["email"],
      });
    }
  });

export type BusinessCardData = z.infer<typeof businessCardDataSchema>;

export function parseBusinessCardData(input: unknown): BusinessCardData {
  const parsed = businessCardDataSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.issues.map((issue) => ({
    code:
      issue.code === z.ZodIssueCode.too_big &&
      (issue.path[0] === "name" || issue.path[0] === "address")
        ? ("LAYOUT_OVERFLOW" as const)
        : ("INVALID_DATA" as const),
    message:
      issue.code === z.ZodIssueCode.too_big && issue.path[0] === "name"
        ? "The name does not fit the business-card identity frame."
        : issue.code === z.ZodIssueCode.too_big && issue.path[0] === "address"
          ? "The address does not fit the business-card contact frame."
          : issue.message,
    path: ["data", ...normalizeDocumentPath(issue.path)],
  }));
  const [first, ...rest] = issues;
  if (!first)
    throw new Error("Business-card validation failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}
