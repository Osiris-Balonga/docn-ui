import { editorialBusinessCardExample } from "@docn-ui/documents/templates/business-cards/editorial/examples";
import { minimalBusinessCardExampleFr } from "@docn-ui/documents/templates/business-cards/minimal/examples";
import { studioBusinessCardExample } from "@docn-ui/documents/templates/business-cards/studio/examples";
import type { BusinessCardTemplateId } from "@docn-ui/documents/templates/business-cards/metadata";
import type {
  DocumentLocale,
  FormatId,
  ThemeId,
} from "@docn-ui/documents/core";
import { toBusinessCardDraft } from "./business-card-form";

export interface BusinessCardFormRegistration {
  defaultFormatId: FormatId;
  defaultLocale: DocumentLocale;
  defaultThemeId: ThemeId;
  initialDraft: ReturnType<typeof toBusinessCardDraft>;
  templateId: BusinessCardTemplateId;
}

export const businessCardFormRegistry = {
  "business-card-editorial": {
    defaultFormatId: "card-90x50",
    defaultLocale: "fr",
    defaultThemeId: "editorial",
    initialDraft: toBusinessCardDraft(editorialBusinessCardExample),
    templateId: "business-card-editorial",
  },
  "business-card-minimal": {
    defaultFormatId: "card-85x55",
    defaultLocale: "fr",
    defaultThemeId: "neutral",
    initialDraft: toBusinessCardDraft(minimalBusinessCardExampleFr),
    templateId: "business-card-minimal",
  },
  "business-card-studio": {
    defaultFormatId: "card-us",
    defaultLocale: "en",
    defaultThemeId: "bold",
    initialDraft: toBusinessCardDraft(studioBusinessCardExample),
    templateId: "business-card-studio",
  },
} as const satisfies Record<
  BusinessCardTemplateId,
  BusinessCardFormRegistration
>;

export function getBusinessCardFormRegistration(
  templateId: BusinessCardTemplateId,
) {
  return businessCardFormRegistry[templateId];
}
