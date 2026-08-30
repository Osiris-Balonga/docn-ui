import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const invoiceStudioMetadata = {
  id: "invoice-studio",
  version: "1.0.0",
  schemaVersion: 1,
  family: "invoice",
  title: "Studio invoice",
  description: "An accent-led invoice with project and total hierarchy.",
  tags: ["invoice", "studio", "creative"],
  supportedFormatIds: ["a4", "letter"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
