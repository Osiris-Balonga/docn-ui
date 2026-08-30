import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const receiptServiceMetadata = {
  id: "receipt-service",
  version: "1.0.0",
  schemaVersion: 1,
  family: "receipt",
  title: "Subscription receipt",
  description:
    "A subscription payment confirmation with paid status, customer, and payment details.",
  tags: ["subscription", "saas", "thermal"],
  supportedFormatIds: ["receipt-58", "receipt-80"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
