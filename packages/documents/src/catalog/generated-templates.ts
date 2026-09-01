import type { TemplateCatalogEntry } from "./manifest";

export const generatedTemplateCatalog = [
  {
    id: "resume-classic",
    slug: "resume-classic",
    title: "Classic two-column resume",
    family: "resume",
    familyLabel: "CVs",
    description:
      "A restrained two-column resume with serif hierarchy and blue section labels.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["editorial"],
    tags: ["resume", "cv", "two-column", "editorial"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "resume-classic-example",
        height: 1684,
        page: 1,
        sha256:
          "8eb553f8f0ef89e031eeb7f32d7d62391a053d8e733dcd33f4d35e0ab018332b",
        src: "/generated/templates/resume-classic-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "bd5faa5bb06c2f3b4b20762703c6f99dd1051a81a3d11b593389148fcd3525ab",
      src: "/generated/templates/resume-classic.pdf",
    },
    thumbnail: {
      fixture: "resume-classic-example",
      height: 1684,
      page: 1,
      sha256:
        "8eb553f8f0ef89e031eeb7f32d7d62391a053d8e733dcd33f4d35e0ab018332b",
      src: "/generated/templates/resume-classic-1.png",
      width: 1191,
    },
  },
  {
    id: "report-photo",
    slug: "report-photo",
    title: "Photo-led report",
    family: "report",
    familyLabel: "Reports",
    description:
      "A two-page editorial report with a large cover image and restrained continuation page.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["report", "editorial", "photo", "multipage"],
    version: "1.0.0",
    sides: 2,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "report-photo-example",
        height: 1684,
        page: 1,
        sha256:
          "5d13e772ca42b6bd9b9379ddcdefe779383b8bbf62e51d5621563c99f2fddda7",
        src: "/generated/templates/report-photo-1.png",
        width: 1191,
      },
      {
        fixture: "report-photo-example",
        height: 1684,
        page: 2,
        sha256:
          "ce5e6bbeeabd8669be3afcb7070a3e19872a0e76e66c7396d3d75156b097746a",
        src: "/generated/templates/report-photo-2.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "3a0d8227ae10ed0b2d28054aec5d15efb997681a00199cd145671826b95cfe84",
      src: "/generated/templates/report-photo.pdf",
    },
    thumbnail: {
      fixture: "report-photo-example",
      height: 1684,
      page: 1,
      sha256:
        "5d13e772ca42b6bd9b9379ddcdefe779383b8bbf62e51d5621563c99f2fddda7",
      src: "/generated/templates/report-photo-1.png",
      width: 1191,
    },
  },
  {
    id: "invoice-stripe",
    slug: "invoice-stripe",
    title: "Stripe-style invoice",
    family: "invoice",
    familyLabel: "Invoices",
    description:
      "A spacious service invoice with clear due amount, line items and bank instructions.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["invoice", "billing", "stripe-style", "payment"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: true,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "invoice-stripe-example",
        height: 1684,
        page: 1,
        sha256:
          "c1113639ac95647616a87defac10684422ff9fca33d107a6b22b5cd9c0a9bf1c",
        src: "/generated/templates/invoice-stripe-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "2297d1f2f509172094f8c8a8494d105f779328077d7392f59f60e927245c4109",
      src: "/generated/templates/invoice-stripe.pdf",
    },
    thumbnail: {
      fixture: "invoice-stripe-example",
      height: 1684,
      page: 1,
      sha256:
        "c1113639ac95647616a87defac10684422ff9fca33d107a6b22b5cd9c0a9bf1c",
      src: "/generated/templates/invoice-stripe-1.png",
      width: 1191,
    },
  },
  {
    id: "receipt-order-confirmation",
    slug: "receipt-order-confirmation",
    title: "Order confirmation",
    family: "receipt",
    familyLabel: "Receipts",
    description:
      "A product order confirmation with metadata, item imagery and a compact payment summary.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["receipt", "order", "confirmation", "commerce"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: true,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "receipt-order-confirmation-example",
        height: 1684,
        page: 1,
        sha256:
          "d6463180bb758553a268a08d5794d5a82f104d7bd10ab3e6c16d4902aa180553",
        src: "/generated/templates/receipt-order-confirmation-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "a06c69f51b69c2dd2adf51e14f3f4517885a3d1b91bee032c1a0e0198456ea10",
      src: "/generated/templates/receipt-order-confirmation.pdf",
    },
    thumbnail: {
      fixture: "receipt-order-confirmation-example",
      height: 1684,
      page: 1,
      sha256:
        "d6463180bb758553a268a08d5794d5a82f104d7bd10ab3e6c16d4902aa180553",
      src: "/generated/templates/receipt-order-confirmation-1.png",
      width: 1191,
    },
  },
] as const satisfies readonly TemplateCatalogEntry[];
