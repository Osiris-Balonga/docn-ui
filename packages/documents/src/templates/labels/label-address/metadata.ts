import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const labelAddressMetadata = {
  id: "label-address",
  version: "1.0.0",
  schemaVersion: 1,
  family: "label",
  title: "Address label",
  description: "A recipient-led address label with an optional sender marker.",
  tags: ["address", "shipping", "recipient"],
  supportedFormatIds: ["label-70x37", "label-100x50", "label-custom"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;
