import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const receiptHospitalityMetadata = {
  id: "receipt-hospitality",
  version: "1.0.0",
  schemaVersion: 1,
  family: "receipt",
  title: "Hospitality receipt",
  description: "A restaurant receipt with table context and a service footer.",
  tags: ["hospitality", "restaurant", "thermal"],
  supportedFormatIds: ["receipt-58", "receipt-80"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
