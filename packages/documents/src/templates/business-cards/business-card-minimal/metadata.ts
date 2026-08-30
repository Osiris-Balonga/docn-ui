import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const BUSINESS_CARD_FORMAT_IDS = [
  "card-85x55",
  "card-90x50",
  "card-us",
] as const;

export const businessCardMinimalMetadata = {
  id: "business-card-minimal",
  version: "1.0.0",
  schemaVersion: 1,
  family: "business-card",
  title: "Minimal business card",
  description:
    "A two-sided card with a quiet brand header, dominant identity, and compact contact columns.",
  tags: ["minimal", "professional", "two-sided"],
  supportedFormatIds: BUSINESS_CARD_FORMAT_IDS,
  supportedThemeIds: THEME_IDS,
  sides: 2,
  capabilities: {
    logo: true,
    printProfiles: true,
    qr: false,
  },
} as const satisfies TemplateMetadata & {
  capabilities: {
    logo: boolean;
    printProfiles: boolean;
    qr: boolean;
  };
  description: string;
  sides: 2;
  tags: readonly string[];
  title: string;
};
