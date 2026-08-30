import { z } from "zod";
import { CURRENCIES, type CurrencyCode } from "../../core/money";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentIssue,
} from "../../core/errors";

export const RECEIPT_LINE_LIMIT = 200;

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

const merchantSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    address: optionalText(240),
    contact: optionalText(120),
    taxIdentifier: optionalText(80),
    logoAssetId: optionalText(120),
  })
  .strict();

const lineSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    label: z.string().trim().min(1).max(120),
    quantity: z.number().int().min(1).max(10_000),
    unitPriceMinor: z.number().int().nonnegative().safe(),
    taxRateBasisPoints: z.number().int().min(0).max(10_000),
  })
  .strict();

function isIanaTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

function containsSensitivePaymentData(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  return /\d{12,19}/.test(digits) || /\b(?:cvv|cvc|pin)\b/i.test(value);
}

export const receiptDataSchema = z
  .object({
    merchant: merchantSchema,
    number: z.string().trim().min(1).max(64),
    occurredAt: z.string().datetime({ offset: true }),
    timeZone: z.string().trim().min(1).max(80),
    currency: z.enum(
      Object.keys(CURRENCIES) as [CurrencyCode, ...CurrencyCode[]],
    ),
    lines: z.array(lineSchema).min(1).max(RECEIPT_LINE_LIMIT),
    paymentMethod: z.string().trim().min(1).max(80),
    table: optionalText(40),
    order: optionalText(40),
    customer: optionalText(120),
    notes: optionalText(500),
  })
  .strict()
  .superRefine((data, context) => {
    if (!isIanaTimeZone(data.timeZone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use a valid IANA time zone.",
        path: ["timeZone"],
      });
    }
    if (containsSensitivePaymentData(data.paymentMethod)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use only a textual payment method without card or PIN data.",
        path: ["paymentMethod"],
      });
    }
  });

export type ReceiptData = z.infer<typeof receiptDataSchema>;
export type ReceiptLine = ReceiptData["lines"][number];

export function parseReceiptData(input: unknown): ReceiptData {
  const parsed = receiptDataSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.issues.map((issue): DocumentIssue => ({
    code:
      issue.code === z.ZodIssueCode.too_big && issue.path[0] === "lines"
        ? "LIMIT_EXCEEDED"
        : "INVALID_DATA",
    message: issue.message,
    path: ["data", ...normalizeDocumentPath(issue.path)],
  }));
  const [first, ...rest] = issues;
  if (!first) throw new Error("Receipt validation failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}
