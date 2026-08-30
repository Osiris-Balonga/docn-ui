import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const invoiceMinimalMetadata = {
  id: "invoice-minimal",
  version: "1.0.0",
  schemaVersion: 1,
  family: "invoice",
  title: "Minimal invoice",
  description:
    "An editorial invoice with a bold title, open parties, and a clear line table.",
  tags: ["invoice", "minimal", "services"],
  supportedFormatIds: ["a4", "letter"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
