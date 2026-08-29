import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";
import { BUSINESS_CARD_FORMAT_IDS } from "../business-card-minimal/metadata";

export const businessCardEditorialMetadata = {
  id: "business-card-editorial",
  version: "1.0.0",
  schemaVersion: 1,
  family: "business-card",
  title: "Editorial business card",
  description:
    "An asymmetric serif-led composition with expanded details on the back.",
  tags: ["editorial", "asymmetric", "two-sided"],
  supportedFormatIds: BUSINESS_CARD_FORMAT_IDS,
  supportedThemeIds: THEME_IDS,
  sides: 2,
  capabilities: { logo: false, printProfiles: true, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
