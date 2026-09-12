import { DocumentValidationError } from "./core/errors";

export const TEMPLATE_IDS = [
  "resume-classic",
  "resume-accountant",
  "resume-designer",
  "invoice-spacious",
  "invoice-vertical",
  "invoice-corporate",
  "invoice-photo-header",
  "receipt-order-confirmation",
  "receipt-product-barcode",
  "receipt-cash-register",
  "report-product-analytics",
  "report-marketplace-revenue",
  "report-customer-support",
  "badge-profile-lanyard",
  "badge-qr-portrait-light",
  "badge-qr-portrait-blue",
  "business-card-coral-qr",
  "business-card-violet-founder",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATE_IDS.includes(value as TemplateId);
}

export function assertTemplateIdSet(
  ids: readonly string[],
  path: readonly (number | string)[] = ["templateIds"],
): asserts ids is readonly TemplateId[] {
  const actual = new Set(ids);
  const expected = new Set<string>(TEMPLATE_IDS);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missing = TEMPLATE_IDS.filter((id) => !actual.has(id));
  const extra = [...actual].filter((id) => !expected.has(id));
  if (duplicates.length === 0 && missing.length === 0 && extra.length === 0) {
    return;
  }
  throw new DocumentValidationError([
    {
      code: "INVALID_DATA",
      message: `Template IDs must match the canonical catalog (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}; duplicates: ${[...new Set(duplicates)].join(", ") || "none"}).`,
      path,
    },
  ]);
}
