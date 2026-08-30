import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const receiptRetailMetadata = {
  id: "receipt-retail",
  version: "1.0.0",
  schemaVersion: 1,
  family: "receipt",
  title: "Retail receipt",
  description: "A compact shop receipt with line taxes and a clear total.",
  tags: ["retail", "thermal", "tax"],
  supportedFormatIds: ["receipt-58", "receipt-80"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
