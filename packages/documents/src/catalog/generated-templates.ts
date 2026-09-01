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
    id: "resume-accountant",
    slug: "resume-accountant",
    title: "Structured accountant resume",
    family: "resume",
    familyLabel: "CVs",
    description:
      "A precise monochrome resume with centered identity, ruled sections and a compact skills row.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["resume", "cv", "accounting", "monochrome"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "resume-accountant-example",
        height: 1684,
        page: 1,
        sha256:
          "b0c5e59e4b4d283ed467d83e4fb1c031dd7cdfbd29c9722b7563150e73c8f5e0",
        src: "/generated/templates/resume-accountant-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "068fc9f7459e2e7a87248a0333a03baf4b10c1e5da11488e29393015cead5169",
      src: "/generated/templates/resume-accountant.pdf",
    },
    thumbnail: {
      fixture: "resume-accountant-example",
      height: 1684,
      page: 1,
      sha256:
        "b0c5e59e4b4d283ed467d83e4fb1c031dd7cdfbd29c9722b7563150e73c8f5e0",
      src: "/generated/templates/resume-accountant-1.png",
      width: 1191,
    },
  },
  {
    id: "resume-designer",
    slug: "resume-designer",
    title: "Green designer resume",
    family: "resume",
    familyLabel: "CVs",
    description:
      "A polished two-column creative resume with an illustrated profile, green accents and compact timelines.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["resume", "cv", "designer", "two-column"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "resume-designer-example",
        height: 1684,
        page: 1,
        sha256:
          "8247d58fd1ed52a3476289415ec1d48e5ea9cf104869a220a7e32695fd48f2c6",
        src: "/generated/templates/resume-designer-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "34ca2e29c7b3b52e64ad2998644cf25762698219f0bf517da81c017ef6bae1b5",
      src: "/generated/templates/resume-designer.pdf",
    },
    thumbnail: {
      fixture: "resume-designer-example",
      height: 1684,
      page: 1,
      sha256:
        "8247d58fd1ed52a3476289415ec1d48e5ea9cf104869a220a7e32695fd48f2c6",
      src: "/generated/templates/resume-designer-1.png",
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
    id: "invoice-vertical",
    slug: "invoice-vertical",
    title: "Vertical studio invoice",
    family: "invoice",
    familyLabel: "Invoices",
    description:
      "A cream editorial invoice with a vertical identity rail, compact services table and QR payment block.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["invoice", "editorial", "services", "qr-payment"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: true,
    },
    pages: [
      {
        fixture: "invoice-vertical-example",
        height: 1684,
        page: 1,
        sha256:
          "164d036ccb2b0a2cd5708724964d87f90c8068164024ad1616dd6d46abbe0852",
        src: "/generated/templates/invoice-vertical-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "ff29fd0bba8bbe064d389a4fb3daa206cc529cf3c1b325b0392d0a5c9315152d",
      src: "/generated/templates/invoice-vertical.pdf",
    },
    thumbnail: {
      fixture: "invoice-vertical-example",
      height: 1684,
      page: 1,
      sha256:
        "164d036ccb2b0a2cd5708724964d87f90c8068164024ad1616dd6d46abbe0852",
      src: "/generated/templates/invoice-vertical-1.png",
      width: 1191,
    },
  },
  {
    id: "invoice-corporate",
    slug: "invoice-corporate",
    title: "Corporate table invoice",
    family: "invoice",
    familyLabel: "Invoices",
    description:
      "A formal corporate invoice with a dark identity header, striped item table and signed totals block.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["invoice", "corporate", "table", "services"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: true,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "invoice-corporate-example",
        height: 1684,
        page: 1,
        sha256:
          "d6b5ae8f068f997c53016039189c413a8ac8a5bdbe5621e2c6ef8ce6f55b42dc",
        src: "/generated/templates/invoice-corporate-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "fbf5d286e3a0502c61629823f6807e28d50df785267ffbe00776b5c38acd6e93",
      src: "/generated/templates/invoice-corporate.pdf",
    },
    thumbnail: {
      fixture: "invoice-corporate-example",
      height: 1684,
      page: 1,
      sha256:
        "d6b5ae8f068f997c53016039189c413a8ac8a5bdbe5621e2c6ef8ce6f55b42dc",
      src: "/generated/templates/invoice-corporate-1.png",
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
