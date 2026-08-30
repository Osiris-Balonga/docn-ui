import { businessCardEditorialMetadata } from "./business-card-editorial/metadata";
import { businessCardMinimalMetadata } from "./business-card-minimal/metadata";
import { businessCardStudioMetadata } from "./business-card-studio/metadata";

export const businessCardTemplateMetadata = {
  "business-card-editorial": businessCardEditorialMetadata,
  "business-card-minimal": businessCardMinimalMetadata,
  "business-card-studio": businessCardStudioMetadata,
} as const;

export type BusinessCardTemplateId = keyof typeof businessCardTemplateMetadata;

export function getBusinessCardTemplateMetadata(templateId: string) {
  return templateId in businessCardTemplateMetadata
    ? businessCardTemplateMetadata[templateId as BusinessCardTemplateId]
    : undefined;
}
