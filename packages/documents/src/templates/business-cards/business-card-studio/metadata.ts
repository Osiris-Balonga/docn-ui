import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";
import { BUSINESS_CARD_FORMAT_IDS } from "../business-card-minimal/metadata";

export const businessCardStudioMetadata = {
  id: "business-card-studio",
  version: "1.0.0",
  schemaVersion: 1,
  family: "business-card",
  title: "Studio business card",
  description:
    "A contrasting brand block, distributed contacts, and a vector QR back.",
  tags: ["studio", "bold", "qr", "two-sided"],
  supportedFormatIds: BUSINESS_CARD_FORMAT_IDS,
  supportedThemeIds: THEME_IDS,
  sides: 2,
  capabilities: { logo: false, printProfiles: true, qr: true },
} as const satisfies TemplateMetadata & Record<string, unknown>;
