import { receiptHospitalityMetadata } from "./receipt-hospitality/metadata";
import { receiptRetailMetadata } from "./receipt-retail/metadata";
import { receiptServiceMetadata } from "./receipt-service/metadata";

export const receiptTemplateMetadata = {
  "receipt-hospitality": receiptHospitalityMetadata,
  "receipt-retail": receiptRetailMetadata,
  "receipt-service": receiptServiceMetadata,
} as const;

export type ReceiptTemplateId = keyof typeof receiptTemplateMetadata;

export function getReceiptTemplateMetadata(templateId: string) {
  return templateId in receiptTemplateMetadata
    ? receiptTemplateMetadata[templateId as ReceiptTemplateId]
    : undefined;
}
