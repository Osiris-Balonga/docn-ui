import { labelAddressMetadata } from "./label-address/metadata";
import { labelInventoryMetadata } from "./label-inventory/metadata";
import { labelProductMetadata } from "./label-product/metadata";

export const labelTemplateMetadata = {
  "label-address": labelAddressMetadata,
  "label-inventory": labelInventoryMetadata,
  "label-product": labelProductMetadata,
} as const;

export type LabelTemplateId = keyof typeof labelTemplateMetadata;

export function getLabelTemplateMetadata(templateId: string) {
  return templateId in labelTemplateMetadata
    ? labelTemplateMetadata[templateId as LabelTemplateId]
    : undefined;
}
