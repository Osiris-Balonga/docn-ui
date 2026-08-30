import { invoiceBusinessMetadata } from "./invoice-business/metadata";
import { invoiceMinimalMetadata } from "./invoice-minimal/metadata";
import { invoiceStudioMetadata } from "./invoice-studio/metadata";

export const invoiceTemplateMetadata = {
  "invoice-business": invoiceBusinessMetadata,
  "invoice-minimal": invoiceMinimalMetadata,
  "invoice-studio": invoiceStudioMetadata,
} as const;

export type InvoiceTemplateId = keyof typeof invoiceTemplateMetadata;

export function getInvoiceTemplateMetadata(templateId: string) {
  return templateId in invoiceTemplateMetadata
    ? invoiceTemplateMetadata[templateId as InvoiceTemplateId]
    : undefined;
}
