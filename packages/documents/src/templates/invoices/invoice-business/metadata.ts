import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const invoiceBusinessMetadata = {
  id: "invoice-business",
  version: "1.0.0",
  schemaVersion: 1,
  family: "invoice",
  title: "Business invoice",
  description:
    "A formal invoice with structured parties and a dark table header.",
  tags: ["invoice", "business", "formal"],
  supportedFormatIds: ["a4", "letter"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
