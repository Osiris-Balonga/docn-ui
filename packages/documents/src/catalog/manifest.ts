import { businessCardEditorialMetadata } from "../templates/business-cards/business-card-editorial/metadata";
import { businessCardMinimalMetadata } from "../templates/business-cards/business-card-minimal/metadata";
import { businessCardStudioMetadata } from "../templates/business-cards/business-card-studio/metadata";
import { eventTicketClassicMetadata } from "../templates/event-tickets/event-ticket-classic/metadata";
import { eventTicketConferenceMetadata } from "../templates/event-tickets/event-ticket-conference/metadata";
import { eventTicketLiveMetadata } from "../templates/event-tickets/event-ticket-live/metadata";

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
  family: "business-card" | "ticket";
  familyLabel: "Business cards" | "Event tickets";
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

type CatalogMetadata =
  | typeof businessCardEditorialMetadata
  | typeof businessCardMinimalMetadata
  | typeof businessCardStudioMetadata
  | typeof eventTicketClassicMetadata
  | typeof eventTicketConferenceMetadata
  | typeof eventTicketLiveMetadata;

function catalogEntry(
  metadata: CatalogMetadata,
  familyLabel: TemplateCatalogEntry["familyLabel"],
  thumbnail: CatalogThumbnail,
): TemplateCatalogEntry {
  return {
    capabilities: metadata.capabilities,
    description: metadata.description,
    family: metadata.family,
    familyLabel,
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
  catalogEntry(businessCardMinimalMetadata, "Business cards", {
    fixture: "minimalBusinessCardExampleFr",
    height: 312,
    page: 1,
    sha256: "54e348d5b715ae6c305e33c273e76d70e40f23d7b4c2904f95d5cbd9f04e0327",
    src: "/generated/catalog/business-card-minimal.png",
    width: 482,
  }),
  catalogEntry(businessCardEditorialMetadata, "Business cards", {
    fixture: "editorialBusinessCardExample",
    height: 284,
    page: 1,
    sha256: "9b885b931c3d1ccbcc365afabd1cc84fac58c28aea93dc6bc2f50b5f211d759f",
    src: "/generated/catalog/business-card-editorial.png",
    width: 511,
  }),
  catalogEntry(businessCardStudioMetadata, "Business cards", {
    fixture: "studioBusinessCardExample",
    height: 288,
    page: 1,
    sha256: "4baf81fc88f82e37d19556136dea9a29457bb358c4721ce0ac359e414ddae2b0",
    src: "/generated/catalog/business-card-studio.png",
    width: 505,
  }),
  catalogEntry(eventTicketClassicMetadata, "Event tickets", {
    fixture: "classicEventTicketExample",
    height: 420,
    page: 1,
    sha256: "c55bc79e9dd69f86d7f54a2b9e846970b20cfb37a6c8277b30eac71e7ec21cb9",
    src: "/generated/catalog/event-ticket-classic.png",
    width: 1191,
  }),
  catalogEntry(eventTicketConferenceMetadata, "Event tickets", {
    fixture: "conferenceEventTicketExample",
    height: 840,
    page: 1,
    sha256: "37f1510fc12bec7eff20cd3e9bdf4aa11ac41f5a0277e9baa0de31fe3370a388",
    src: "/generated/catalog/event-ticket-conference.png",
    width: 596,
  }),
  catalogEntry(eventTicketLiveMetadata, "Event tickets", {
    fixture: "liveEventTicketExample",
    height: 397,
    page: 1,
    sha256: "b8023388d9aff72e0862b6c9efc7d70bf3c3e79d2e46e76a8d4aac279a8e0ae7",
    src: "/generated/catalog/event-ticket-live.png",
    width: 851,
  }),
] as const satisfies readonly TemplateCatalogEntry[];

export function getTemplateCatalogEntry(slug: string) {
  return templateCatalog.find((template) => template.slug === slug);
}
