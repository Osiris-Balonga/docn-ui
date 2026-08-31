import { businessCardEditorialMetadata } from "../templates/business-cards/business-card-editorial/metadata";
import { businessCardMinimalMetadata } from "../templates/business-cards/business-card-minimal/metadata";
import { businessCardStudioMetadata } from "../templates/business-cards/business-card-studio/metadata";
import { eventTicketClassicMetadata } from "../templates/event-tickets/event-ticket-classic/metadata";
import { eventTicketConferenceMetadata } from "../templates/event-tickets/event-ticket-conference/metadata";
import { eventTicketLiveMetadata } from "../templates/event-tickets/event-ticket-live/metadata";
import { invoiceBusinessMetadata } from "../templates/invoices/invoice-business/metadata";
import { invoiceMinimalMetadata } from "../templates/invoices/invoice-minimal/metadata";
import { invoiceStudioMetadata } from "../templates/invoices/invoice-studio/metadata";
import { labelAddressMetadata } from "../templates/labels/label-address/metadata";
import { labelInventoryMetadata } from "../templates/labels/label-inventory/metadata";
import { labelProductMetadata } from "../templates/labels/label-product/metadata";
import { receiptHospitalityMetadata } from "../templates/receipts/receipt-hospitality/metadata";
import { receiptRetailMetadata } from "../templates/receipts/receipt-retail/metadata";
import { receiptServiceMetadata } from "../templates/receipts/receipt-service/metadata";

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
  family: "business-card" | "invoice" | "label" | "receipt" | "ticket";
  familyLabel:
    "Business cards" | "Event tickets" | "Invoices" | "Labels" | "Receipts";
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
  | typeof eventTicketLiveMetadata
  | typeof invoiceBusinessMetadata
  | typeof invoiceMinimalMetadata
  | typeof invoiceStudioMetadata
  | typeof labelAddressMetadata
  | typeof labelInventoryMetadata
  | typeof labelProductMetadata
  | typeof receiptHospitalityMetadata
  | typeof receiptRetailMetadata
  | typeof receiptServiceMetadata;

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
    sha256: "da2630aa2ae017509368fc7adf49927886273549a71e838c27fc73492ea942f0",
    src: "/generated/catalog/business-card-minimal.png",
    width: 482,
  }),
  catalogEntry(businessCardEditorialMetadata, "Business cards", {
    fixture: "editorialBusinessCardExample",
    height: 284,
    page: 1,
    sha256: "170b078262b3d5cc2f69f301a2d909fceabacf2230f8708a2367b797153c48d4",
    src: "/generated/catalog/business-card-editorial.png",
    width: 511,
  }),
  catalogEntry(businessCardStudioMetadata, "Business cards", {
    fixture: "studioBusinessCardExample",
    height: 289,
    page: 1,
    sha256: "21eb18367922adc0ac6b116b4eedf51d1ca0ce9dd1644fb48dd757a823afbf7e",
    src: "/generated/catalog/business-card-studio.png",
    width: 505,
  }),
  catalogEntry(eventTicketClassicMetadata, "Event tickets", {
    fixture: "classicEventTicketExample",
    height: 420,
    page: 1,
    sha256: "e1e0d94457f2dfbd3042c85ddc215d7d5aafe13f1bbd34bb7dc25a220f652bb4",
    src: "/generated/catalog/event-ticket-classic.png",
    width: 1191,
  }),
  catalogEntry(eventTicketConferenceMetadata, "Event tickets", {
    fixture: "conferenceEventTicketExample",
    height: 841,
    page: 1,
    sha256: "bed29025958b9fd0a5ba552acba2526cf3ccdb498d61f2d75420f1fb279177b0",
    src: "/generated/catalog/event-ticket-conference.png",
    width: 596,
  }),
  catalogEntry(eventTicketLiveMetadata, "Event tickets", {
    fixture: "liveEventTicketExample",
    height: 398,
    page: 1,
    sha256: "9c840fdc51e50b102d950bb8ef45017a9221f67ec71f2846dd4dbd579f1b0e93",
    src: "/generated/catalog/event-ticket-live.png",
    width: 851,
  }),
  catalogEntry(receiptRetailMetadata, "Receipts", {
    fixture: "retailReceiptExample",
    height: 632,
    page: 1,
    sha256: "9d7bf1f3312ed308606698642f1f2139c4a380e0c58ff42d735f5a3bf0530978",
    src: "/generated/catalog/receipt-retail.png",
    width: 329,
  }),
  catalogEntry(receiptHospitalityMetadata, "Receipts", {
    fixture: "hospitalityReceiptExample",
    height: 505,
    page: 1,
    sha256: "90e1addf3692ac163bcb7f21312f31010311cdf55e292a6522ceabc04d57cd3f",
    src: "/generated/catalog/receipt-hospitality.png",
    width: 378,
  }),
  catalogEntry(receiptServiceMetadata, "Receipts", {
    fixture: "serviceReceiptExample",
    height: 535,
    page: 1,
    sha256: "18c71dc27c983246d312e736e7a7815ef5b28af3a5795eccb10525d0b104aee8",
    src: "/generated/catalog/receipt-service.png",
    width: 378,
  }),
  catalogEntry(labelProductMetadata, "Labels", {
    fixture: "productLabelExample",
    height: 210,
    page: 1,
    sha256: "fb3624aa53e82798b91426d1cbcfcac7520ca3515f16d6ffa9f73b23ba86b53a",
    src: "/generated/catalog/label-product.png",
    width: 397,
  }),
  catalogEntry(labelAddressMetadata, "Labels", {
    fixture: "addressLabelExample",
    height: 284,
    page: 1,
    sha256: "a07211f3dc4456467216eb50db8de77c1c05174c6fa0983d2785cd9aa3d9b424",
    src: "/generated/catalog/label-address.png",
    width: 567,
  }),
  catalogEntry(labelInventoryMetadata, "Labels", {
    fixture: "inventoryLabelExample",
    height: 284,
    page: 1,
    sha256: "4d6277d50db7c476cb7b22ea807f6e1025de566dcfac655fc969fed899394c36",
    src: "/generated/catalog/label-inventory.png",
    width: 567,
  }),
  catalogEntry(invoiceMinimalMetadata, "Invoices", {
    fixture: "minimalInvoiceExample",
    height: 679,
    page: 1,
    sha256: "f0b4f74f50fbfb6f65fbf78cca2bf503df191ffffd89bde479709b7f9758f75b",
    src: "/generated/catalog/invoice-minimal.png",
    width: 480,
  }),
  catalogEntry(invoiceBusinessMetadata, "Invoices", {
    fixture: "businessInvoiceExample",
    height: 622,
    page: 1,
    sha256: "e5c6a9c70080b249b0fa0a85721e7c51139d211b10b5c9afbc10725db3ea7c9b",
    src: "/generated/catalog/invoice-business.png",
    width: 480,
  }),
  catalogEntry(invoiceStudioMetadata, "Invoices", {
    fixture: "studioInvoiceExample",
    height: 679,
    page: 1,
    sha256: "7bd4abfb0fb58cb82730e9e350c0874d0b5b4211e1dcca2140a5023a2f358f47",
    src: "/generated/catalog/invoice-studio.png",
    width: 480,
  }),
] as const satisfies readonly TemplateCatalogEntry[];

export function getTemplateCatalogEntry(slug: string) {
  return templateCatalog.find((template) => template.slug === slug);
}
