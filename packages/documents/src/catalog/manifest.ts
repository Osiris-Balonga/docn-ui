import { generatedTemplateCatalog } from "./generated-templates";

export type TemplateFamily =
  "badge" | "business-card" | "invoice" | "receipt" | "report" | "resume";

export interface TemplateFamilyDefinition {
  id: TemplateFamily;
  label: string;
}

export const templateFamilies = [
  { id: "invoice", label: "Invoices" },
  { id: "receipt", label: "Receipts" },
  { id: "resume", label: "CVs" },
  { id: "report", label: "Reports" },
  { id: "badge", label: "Badges" },
  { id: "business-card", label: "Business Cards" },
] as const satisfies readonly TemplateFamilyDefinition[];

export interface CatalogThumbnail {
  fixture: string;
  height: number;
  page: number;
  sha256: string;
  src: string;
  width: number;
}

export interface TemplateCatalogEntry {
  capabilities: {
    logo: boolean;
    printProfiles: boolean;
    qr: boolean;
  };
  description: string;
  family: TemplateFamily;
  familyLabel: string;
  id: string;
  pages: readonly CatalogThumbnail[];
  pdf: {
    revision: string;
    src: string;
  };
  sides: number;
  slug: string;
  supportedFormatIds: readonly string[];
  supportedThemeIds: readonly string[];
  tags: readonly string[];
  thumbnail: CatalogThumbnail;
  title: string;
  version: string;
}

export const templateCatalog: readonly TemplateCatalogEntry[] =
  generatedTemplateCatalog;

export function getTemplateCatalogEntry(slug: string) {
  return templateCatalog.find((template) => template.slug === slug);
}
