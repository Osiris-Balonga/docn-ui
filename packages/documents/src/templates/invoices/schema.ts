import { z } from "zod";
import { CURRENCIES, type CurrencyCode } from "../../core/money";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentIssue,
} from "../../core/errors";

export const INVOICE_LINE_LIMIT = 200;
export const INVOICE_LEGAL_FIELD_LIMIT = 8;
export const INVOICE_ROW_EXPLICIT_LINE_LIMIT = 5;

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

const partySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    address: z.array(z.string().trim().min(1).max(120)).max(5).default([]),
    email: optionalText(120),
    phone: optionalText(80),
    taxIdentifier: optionalText(80),
  })
  .strict();

const lineSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    label: z.string().trim().min(1).max(240),
    description: optionalText(500),
    quantity: z.number().int().min(1).max(10_000),
    unitPriceMinor: z.number().int().nonnegative().safe(),
    taxRateBasisPoints: z.number().int().min(0).max(10_000),
  })
  .strict();

const legalFieldSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(500),
  })
  .strict();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use an ISO date in YYYY-MM-DD format.");

export const invoiceDataSchema = z
  .object({
    seller: partySchema,
    customer: partySchema,
    number: z.string().trim().min(1).max(64),
    issueDate: isoDate,
    dueDate: isoDate,
    currency: z.enum(
      Object.keys(CURRENCIES) as [CurrencyCode, ...CurrencyCode[]],
    ),
    project: optionalText(120),
    lines: z.array(lineSchema).min(1).max(INVOICE_LINE_LIMIT),
    notes: optionalText(2_000),
    terms: optionalText(2_000),
    legalFields: z
      .array(legalFieldSchema)
      .max(INVOICE_LEGAL_FIELD_LIMIT)
      .default([]),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.dueDate < data.issueDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be earlier than issue date.",
        path: ["dueDate"],
      });
    }
    const seenIds = new Set<string>();
    data.lines.forEach((line, index) => {
      if (seenIds.has(line.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invoice line identifiers must be unique.",
          path: ["lines", index, "id"],
        });
      }
      seenIds.add(line.id);
      const explicitLineCount = line.label.split(/\r?\n/).length;
      if (explicitLineCount > INVOICE_ROW_EXPLICIT_LINE_LIMIT) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `A line label cannot exceed ${INVOICE_ROW_EXPLICIT_LINE_LIMIT} explicit lines.`,
          path: ["lines", index, "label"],
        });
      }
    });
  });

export type InvoiceData = z.infer<typeof invoiceDataSchema>;
export type InvoiceLine = InvoiceData["lines"][number];

export function parseInvoiceData(input: unknown): InvoiceData {
  const parsed = invoiceDataSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.issues.map((issue): DocumentIssue => ({
    code:
      issue.code === z.ZodIssueCode.too_big && issue.path[0] === "lines"
        ? "LIMIT_EXCEEDED"
        : issue.message.includes("explicit lines")
          ? "LAYOUT_OVERFLOW"
          : "INVALID_DATA",
    message: issue.message,
    path: ["data", ...normalizeDocumentPath(issue.path)],
  }));
  const [first, ...rest] = issues;
  if (!first) throw new Error("Invoice validation failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}
