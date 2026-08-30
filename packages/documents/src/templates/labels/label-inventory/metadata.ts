import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const labelInventoryMetadata = {
  id: "label-inventory",
  version: "1.0.0",
  schemaVersion: 1,
  family: "label",
  title: "Inventory label",
  description: "A high-visibility asset identifier with location and QR area.",
  tags: ["inventory", "asset", "qr"],
  supportedFormatIds: ["label-100x50", "label-custom"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: true },
} as const satisfies TemplateMetadata & Record<string, unknown>;
