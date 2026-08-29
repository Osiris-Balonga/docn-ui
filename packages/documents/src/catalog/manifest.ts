import { businessCardEditorialMetadata } from "../templates/business-cards/business-card-editorial/metadata";
import { businessCardMinimalMetadata } from "../templates/business-cards/business-card-minimal/metadata";
import { businessCardStudioMetadata } from "../templates/business-cards/business-card-studio/metadata";

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
  family: "business-card";
  familyLabel: "Business card";
  id: string;
  sides: number;
  slug: string;
  supportedFormatIds: readonly string[];
  supportedThemeIds: readonly string[];
  tags: readonly string[];
  thumbnail: CatalogThumbnail;
  title: string;
  version: string;
}

function cardEntry(
  metadata:
    | typeof businessCardEditorialMetadata
    | typeof businessCardMinimalMetadata
    | typeof businessCardStudioMetadata,
  thumbnail: CatalogThumbnail,
): TemplateCatalogEntry {
  return {
    capabilities: metadata.capabilities,
    description: metadata.description,
    family: metadata.family,
    familyLabel: "Business card",
    id: metadata.id,
    sides: metadata.sides,
    slug: metadata.id,
    supportedFormatIds: metadata.supportedFormatIds,
    supportedThemeIds: metadata.supportedThemeIds,
    tags: metadata.tags,
    thumbnail,
    title: metadata.title,
    version: metadata.version,
  };
}

export const templateCatalog = [
  cardEntry(businessCardMinimalMetadata, {
    fixture: "minimalBusinessCardExampleFr",
    height: 312,
    page: 1,
    sha256: "54e348d5b715ae6c305e33c273e76d70e40f23d7b4c2904f95d5cbd9f04e0327",
    src: "/generated/catalog/business-card-minimal.png",
    width: 482,
  }),
  cardEntry(businessCardEditorialMetadata, {
    fixture: "editorialBusinessCardExample",
    height: 283,
    page: 1,
    sha256: "9b885b931c3d1ccbcc365afabd1cc84fac58c28aea93dc6bc2f50b5f211d759f",
    src: "/generated/catalog/business-card-editorial.png",
    width: 510,
  }),
  cardEntry(businessCardStudioMetadata, {
    fixture: "studioBusinessCardExample",
    height: 288,
    page: 1,
    sha256: "4baf81fc88f82e37d19556136dea9a29457bb358c4721ce0ac359e414ddae2b0",
    src: "/generated/catalog/business-card-studio.png",
    width: 504,
  }),
] as const satisfies readonly TemplateCatalogEntry[];

export function getTemplateCatalogEntry(slug: string) {
  return templateCatalog.find((template) => template.slug === slug);
}
