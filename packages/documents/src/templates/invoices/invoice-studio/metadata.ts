import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const invoiceStudioMetadata = {
  id: "invoice-studio",
  version: "1.0.0",
  schemaVersion: 1,
  family: "invoice",
  title: "Subscription invoice",
  description:
    "An editorial billing statement with a vertical rail, usage, and payment references.",
  tags: ["invoice", "subscription", "saas"],
  supportedFormatIds: ["a4", "letter"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
