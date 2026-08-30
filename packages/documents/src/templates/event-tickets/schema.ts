import { z } from "zod";
import {
  DocumentValidationError,
  normalizeDocumentPath,
  type DocumentIssue,
} from "../../core/errors";

const MAX_QR_PAYLOAD_BYTES = 512;

function optionalText(schema: z.ZodString) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional(),
  );
}

function isIanaTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export const eventTicketDataSchema = z
  .object({
    eventName: z.string().trim().min(1).max(120),
    startsAt: z.string().datetime({ offset: true }),
    timeZone: z.string().trim().min(1).max(80),
    venue: z.string().trim().min(1).max(120),
    attendeeName: optionalText(z.string().trim().min(1).max(80)),
    ticketId: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
        "Use a printable ticket identifier.",
      ),
    category: optionalText(z.string().trim().min(1).max(40)),
    seat: optionalText(z.string().trim().min(1).max(30)),
    qrPayload: z.string().min(1).max(512),
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
    if (
      new TextEncoder().encode(data.qrPayload).byteLength > MAX_QR_PAYLOAD_BYTES
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `QR payload exceeds ${MAX_QR_PAYLOAD_BYTES} UTF-8 bytes.`,
        path: ["qrPayload"],
        params: { documentCode: "LIMIT_EXCEEDED" },
      });
    }
  });

export type EventTicketData = z.infer<typeof eventTicketDataSchema>;

export interface FormattedEventStart {
  date: string;
  time: string;
  timeZone: string;
}

export function formatEventStart(
  startsAt: string,
  timeZone: string,
  locale: "en" | "fr",
): FormattedEventStart {
  const instant = new Date(startsAt);
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";
  return {
    date: new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "short",
      timeZone,
      year: "numeric",
    }).format(instant),
    time: new Intl.DateTimeFormat(intlLocale, {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone,
    }).format(instant),
    timeZone,
  };
}

export function parseEventTicketData(input: unknown): EventTicketData {
  const parsed = eventTicketDataSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.issues.map((issue): DocumentIssue => ({
    code:
      issue.code === z.ZodIssueCode.custom &&
      issue.params?.documentCode === "LIMIT_EXCEEDED"
        ? "LIMIT_EXCEEDED"
        : "INVALID_DATA",
    message: issue.message,
    path: ["data", ...normalizeDocumentPath(issue.path)],
  }));
  const [first, ...rest] = issues;
  if (!first)
    throw new Error("Event-ticket validation failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}
