import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const labelProductMetadata = {
  id: "label-product",
  version: "1.0.0",
  schemaVersion: 1,
  family: "label",
  title: "Product label",
  description:
    "A product-first label with reference, concise details, and optional QR.",
  tags: ["product", "retail", "qr"],
  supportedFormatIds: ["label-70x37", "label-100x50", "label-custom"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: true },
} as const satisfies TemplateMetadata & Record<string, unknown>;
