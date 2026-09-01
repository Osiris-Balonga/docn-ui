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
          "d769bf8b7972fa4eb943a5223fca65272da5e882744a9f67ee16b0e32e93a46f",
        src: "/generated/templates/resume-designer-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "b1789bc6bec2b682a87a6353f366b62dfcfc5b7f2693e270f8231bdd761e516d",
      src: "/generated/templates/resume-designer.pdf",
    },
    thumbnail: {
      fixture: "resume-designer-example",
      height: 1684,
      page: 1,
      sha256:
        "d769bf8b7972fa4eb943a5223fca65272da5e882744a9f67ee16b0e32e93a46f",
      src: "/generated/templates/resume-designer-1.png",
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
          "c4214d67c4e9aa7c192075cd6552446fef8e9a3a33d13b858a5a287b1fa87d2d",
        src: "/generated/templates/invoice-stripe-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "d0f6797ddc639a3fcfef3e7aad34d3f57e6d5d43392efe74803f7f0617941d4c",
      src: "/generated/templates/invoice-stripe.pdf",
    },
    thumbnail: {
      fixture: "invoice-stripe-example",
      height: 1684,
      page: 1,
      sha256:
        "c4214d67c4e9aa7c192075cd6552446fef8e9a3a33d13b858a5a287b1fa87d2d",
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
          "504aac35ce268de3bc7c3252d1efcbb3b63bd9dbf3b68220149d8d62313fd5bc",
        src: "/generated/templates/receipt-order-confirmation-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "9faf2b07663d7d47b68addbb277b35c2259216efc2454124c1eca6d89c0483f1",
      src: "/generated/templates/receipt-order-confirmation.pdf",
    },
    thumbnail: {
      fixture: "receipt-order-confirmation-example",
      height: 1684,
      page: 1,
      sha256:
        "504aac35ce268de3bc7c3252d1efcbb3b63bd9dbf3b68220149d8d62313fd5bc",
      src: "/generated/templates/receipt-order-confirmation-1.png",
      width: 1191,
    },
  },
] as const satisfies readonly TemplateCatalogEntry[];
