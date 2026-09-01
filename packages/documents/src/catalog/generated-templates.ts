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
          "75475670142a4c71d713328e57feb4069bff88096a1201df3252fdef29fcface",
        src: "/generated/templates/resume-designer-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "be6249ceb724ea67486560944b03f2247997a8d01c215bbddef7bd31fa41bf43",
      src: "/generated/templates/resume-designer.pdf",
    },
    thumbnail: {
      fixture: "resume-designer-example",
      height: 1684,
      page: 1,
      sha256:
        "75475670142a4c71d713328e57feb4069bff88096a1201df3252fdef29fcface",
      src: "/generated/templates/resume-designer-1.png",
      width: 1191,
    },
  },
  {
    id: "invoice-spacious",
    slug: "invoice-spacious",
    title: "Spacious service invoice",
    family: "invoice",
    familyLabel: "Invoices",
    description:
      "A spacious service invoice with clear due amount, line items and bank instructions.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["invoice", "billing", "spacious", "payment"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: true,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "invoice-spacious-example",
        height: 1684,
        page: 1,
        sha256:
          "473008a2c06fbc5e52d15714b1fcce0f708940cb2ad5d333304c6191dd1440bf",
        src: "/generated/templates/invoice-spacious-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "ed98b1344ee658f37aad50bf40dd903cf4afd938ca5d545c5c01861ebe29c0b9",
      src: "/generated/templates/invoice-spacious.pdf",
    },
    thumbnail: {
      fixture: "invoice-spacious-example",
      height: 1684,
      page: 1,
      sha256:
        "473008a2c06fbc5e52d15714b1fcce0f708940cb2ad5d333304c6191dd1440bf",
      src: "/generated/templates/invoice-spacious-1.png",
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
      "A formal corporate invoice with a dark identity header, alternating item table and signed totals block.",
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
          "cdf0e9d245a8331dc84f1653e7e72dcd37867ff28b785c5e307a92469a436dbb",
        src: "/generated/templates/invoice-corporate-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "a159a1d97dbe97c4a41e3e67a0a487d8564d66e6e59f8908f0c0c1e377714d6e",
      src: "/generated/templates/invoice-corporate.pdf",
    },
    thumbnail: {
      fixture: "invoice-corporate-example",
      height: 1684,
      page: 1,
      sha256:
        "cdf0e9d245a8331dc84f1653e7e72dcd37867ff28b785c5e307a92469a436dbb",
      src: "/generated/templates/invoice-corporate-1.png",
      width: 1191,
    },
  },
  {
    id: "invoice-photo-header",
    slug: "invoice-photo-header",
    title: "Photo header invoice",
    family: "invoice",
    familyLabel: "Invoices",
    description:
      "A minimalist invoice with a wide original landscape, oversized title and precise billing summary.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["invoice", "photo", "minimal", "service"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "invoice-photo-header-example",
        height: 1684,
        page: 1,
        sha256:
          "14f26fc62325df2c9e21a8a940085b435b763649b347b6886e72fac479880820",
        src: "/generated/templates/invoice-photo-header-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "a1b9b9b51c7a7a5510bcc393c4d328656e7ec37aaeb460655fc35bee3ab243a7",
      src: "/generated/templates/invoice-photo-header.pdf",
    },
    thumbnail: {
      fixture: "invoice-photo-header-example",
      height: 1684,
      page: 1,
      sha256:
        "14f26fc62325df2c9e21a8a940085b435b763649b347b6886e72fac479880820",
      src: "/generated/templates/invoice-photo-header-1.png",
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
          "02f29dfb898ec66ffcc98fec3f89d900b91334c7740a2e25cd9be06d64883896",
        src: "/generated/templates/receipt-order-confirmation-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "66d920b8c7a54e7d7b2ce1305f97f12f814d38d0ae3001cf8f27a62006a2918c",
      src: "/generated/templates/receipt-order-confirmation.pdf",
    },
    thumbnail: {
      fixture: "receipt-order-confirmation-example",
      height: 1684,
      page: 1,
      sha256:
        "02f29dfb898ec66ffcc98fec3f89d900b91334c7740a2e25cd9be06d64883896",
      src: "/generated/templates/receipt-order-confirmation-1.png",
      width: 1191,
    },
  },
  {
    id: "receipt-product-barcode",
    slug: "receipt-product-barcode",
    title: "Product barcode receipt",
    family: "receipt",
    familyLabel: "Receipts",
    description:
      "A compact branded product receipt with a date, two line items and a machine-readable barcode.",
    supportedFormatIds: ["receipt-80"],
    supportedThemeIds: ["neutral"],
    tags: ["receipt", "barcode", "product"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "receipt-product-barcode-example",
        height: 567,
        page: 1,
        sha256:
          "23feecc18308a656cc779627ee56d6ab6aceb63a4eed628d53b259522bb42841",
        src: "/generated/templates/receipt-product-barcode-1.png",
        width: 454,
      },
    ],
    pdf: {
      revision:
        "99161bd7b8f08b36f3d4857918abb80e972d7d2df682f37c9004f38a8eb33060",
      src: "/generated/templates/receipt-product-barcode.pdf",
    },
    thumbnail: {
      fixture: "receipt-product-barcode-example",
      height: 567,
      page: 1,
      sha256:
        "23feecc18308a656cc779627ee56d6ab6aceb63a4eed628d53b259522bb42841",
      src: "/generated/templates/receipt-product-barcode-1.png",
      width: 454,
    },
  },
  {
    id: "receipt-cash-register",
    slug: "receipt-cash-register",
    title: "Cash register receipt",
    family: "receipt",
    familyLabel: "Receipts",
    description:
      "A narrow monospaced-style cash receipt with item rows, tax summary and barcode.",
    supportedFormatIds: ["receipt-80"],
    supportedThemeIds: ["editorial"],
    tags: ["receipt", "cash", "thermal", "barcode"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "receipt-cash-register-example",
        height: 806,
        page: 1,
        sha256:
          "49fa9c89577ed364d4364678c94dbeb19fd5e02f4066c2bb78c5a5b6325196d4",
        src: "/generated/templates/receipt-cash-register-1.png",
        width: 454,
      },
    ],
    pdf: {
      revision:
        "a8660e721d4104bd6159244e8a321778045132be10783947a9ea19e0a429993a",
      src: "/generated/templates/receipt-cash-register.pdf",
    },
    thumbnail: {
      fixture: "receipt-cash-register-example",
      height: 806,
      page: 1,
      sha256:
        "49fa9c89577ed364d4364678c94dbeb19fd5e02f4066c2bb78c5a5b6325196d4",
      src: "/generated/templates/receipt-cash-register-1.png",
      width: 454,
    },
  },
  {
    id: "report-product-analytics",
    slug: "report-product-analytics",
    title: "Product analytics report",
    family: "report",
    familyLabel: "Reports",
    description:
      "A KPI-led analytics report with six metrics and a full-width acquisition trend chart.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["report", "analytics", "kpi", "chart"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "report-product-analytics-example",
        height: 1684,
        page: 1,
        sha256:
          "48542803ca5dfffc4c30f6781686ef23f668e2ee664797f610167e3076870cc2",
        src: "/generated/templates/report-product-analytics-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "d85acbc9ba9359dd0a60d90044ebd8db96aab99fe87410105fff88c4f0de52d8",
      src: "/generated/templates/report-product-analytics.pdf",
    },
    thumbnail: {
      fixture: "report-product-analytics-example",
      height: 1684,
      page: 1,
      sha256:
        "48542803ca5dfffc4c30f6781686ef23f668e2ee664797f610167e3076870cc2",
      src: "/generated/templates/report-product-analytics-1.png",
      width: 1191,
    },
  },
  {
    id: "report-marketplace-revenue",
    slug: "report-marketplace-revenue",
    title: "Marketplace revenue report",
    family: "report",
    familyLabel: "Reports",
    description:
      "A concise annual revenue report with a centered chart, legend and explanatory conclusion.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["report", "marketplace", "revenue", "bar-chart"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "report-marketplace-revenue-example",
        height: 1684,
        page: 1,
        sha256:
          "3d64b0aa6167699f945540e835c69f09cea9c931208a4e8ae8f1e58d577e731d",
        src: "/generated/templates/report-marketplace-revenue-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "a35feb96f6da7f001e707462e44d543f89de066a69eac23401bd540cd55c5dbd",
      src: "/generated/templates/report-marketplace-revenue.pdf",
    },
    thumbnail: {
      fixture: "report-marketplace-revenue-example",
      height: 1684,
      page: 1,
      sha256:
        "3d64b0aa6167699f945540e835c69f09cea9c931208a4e8ae8f1e58d577e731d",
      src: "/generated/templates/report-marketplace-revenue-1.png",
      width: 1191,
    },
  },
  {
    id: "report-customer-support",
    slug: "report-customer-support",
    title: "Customer support report",
    family: "report",
    familyLabel: "Reports",
    description:
      "A research-style service report combining rating charts, key findings and customer quotes.",
    supportedFormatIds: ["a4"],
    supportedThemeIds: ["neutral"],
    tags: ["report", "research", "support", "survey"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: false,
      qr: false,
    },
    pages: [
      {
        fixture: "report-customer-support-example",
        height: 1684,
        page: 1,
        sha256:
          "1695645e2c209eed8b82f98de5652f67c13ae0ae5963b50af33a3b8719e6089e",
        src: "/generated/templates/report-customer-support-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "24f66bad0ee53addc1daf5891165c9bf40b7f35f0c032648d1a6497e50d650f6",
      src: "/generated/templates/report-customer-support.pdf",
    },
    thumbnail: {
      fixture: "report-customer-support-example",
      height: 1684,
      page: 1,
      sha256:
        "1695645e2c209eed8b82f98de5652f67c13ae0ae5963b50af33a3b8719e6089e",
      src: "/generated/templates/report-customer-support-1.png",
      width: 1191,
    },
  },
  {
    id: "badge-creative-team",
    slug: "badge-creative-team",
    title: "Creative team badge",
    family: "badge",
    familyLabel: "Badges",
    description:
      "A portrait employee badge with a lime identity field, large photograph and charcoal name panel.",
    supportedFormatIds: ["badge-54x86"],
    supportedThemeIds: ["neutral"],
    tags: ["badge", "employee", "portrait", "creative"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: false,
    },
    pages: [
      {
        fixture: "badge-creative-team-example",
        height: 486,
        page: 1,
        sha256:
          "4ccf85a8aba35ac7edcbeb4efa78cb48a4b083d14e560bf634cb9e970d7756e2",
        src: "/generated/templates/badge-creative-team-1.png",
        width: 307,
      },
    ],
    pdf: {
      revision:
        "8dc1c65c1f07778ed26c7ffb359dfb8e4b272402b58408de41450ddb020d362b",
      src: "/generated/templates/badge-creative-team.pdf",
    },
    thumbnail: {
      fixture: "badge-creative-team-example",
      height: 486,
      page: 1,
      sha256:
        "4ccf85a8aba35ac7edcbeb4efa78cb48a4b083d14e560bf634cb9e970d7756e2",
      src: "/generated/templates/badge-creative-team-1.png",
      width: 307,
    },
  },
  {
    id: "badge-developer",
    slug: "badge-developer",
    title: "Developer badge",
    family: "badge",
    familyLabel: "Badges",
    description:
      "A dark technical employee badge with lavender type, role metadata and a framed portrait.",
    supportedFormatIds: ["badge-54x86"],
    supportedThemeIds: ["neutral"],
    tags: ["badge", "employee", "developer", "portrait"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: false,
    },
    pages: [
      {
        fixture: "badge-developer-example",
        height: 486,
        page: 1,
        sha256:
          "7a80de07ba5c2f544584c99262ff2a4e5de3e11058546b621a3c138b8d10e209",
        src: "/generated/templates/badge-developer-1.png",
        width: 307,
      },
    ],
    pdf: {
      revision:
        "760d49d340118f5e9d43a090764bba6d8f9841e3099b9dc92ed2cdf5b2e050d3",
      src: "/generated/templates/badge-developer.pdf",
    },
    thumbnail: {
      fixture: "badge-developer-example",
      height: 486,
      page: 1,
      sha256:
        "7a80de07ba5c2f544584c99262ff2a4e5de3e11058546b621a3c138b8d10e209",
      src: "/generated/templates/badge-developer-1.png",
      width: 307,
    },
  },
  {
    id: "business-card-coral-qr",
    slug: "business-card-coral-qr",
    title: "Coral QR business card",
    family: "business-card",
    familyLabel: "Business Cards",
    description:
      "A two-sided coral and white contact card with a scannable QR code and reverse brand field.",
    supportedFormatIds: ["card-90x50"],
    supportedThemeIds: ["neutral"],
    tags: ["business-card", "two-sided", "qr", "coral"],
    version: "1.0.0",
    sides: 2,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: true,
    },
    pages: [
      {
        fixture: "business-card-coral-qr-example",
        height: 284,
        page: 1,
        sha256:
          "7d2f61e2c4bfe61802bf2331de4ba09bf19ce87b25476ffc7504b65771f56aee",
        src: "/generated/templates/business-card-coral-qr-1.png",
        width: 511,
      },
      {
        fixture: "business-card-coral-qr-example",
        height: 284,
        page: 2,
        sha256:
          "06a92c3ff690891197f98470b8afab1d5be96648957d4fb4dd587bde2fe59b94",
        src: "/generated/templates/business-card-coral-qr-2.png",
        width: 511,
      },
    ],
    pdf: {
      revision:
        "c0f36e2664768089ba72ca7a8948fb7886bed038cb53c2747e61abd3cbd60b62",
      src: "/generated/templates/business-card-coral-qr.pdf",
    },
    thumbnail: {
      fixture: "business-card-coral-qr-example",
      height: 284,
      page: 1,
      sha256:
        "7d2f61e2c4bfe61802bf2331de4ba09bf19ce87b25476ffc7504b65771f56aee",
      src: "/generated/templates/business-card-coral-qr-1.png",
      width: 511,
    },
  },
  {
    id: "business-card-violet-founder",
    slug: "business-card-violet-founder",
    title: "Violet founder business card",
    family: "business-card",
    familyLabel: "Business Cards",
    description:
      "A two-sided founder card with a vivid violet brand face and restrained black contact reverse.",
    supportedFormatIds: ["card-85x55"],
    supportedThemeIds: ["neutral"],
    tags: ["business-card", "two-sided", "founder", "violet"],
    version: "1.0.0",
    sides: 2,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: false,
    },
    pages: [
      {
        fixture: "business-card-violet-founder-example",
        height: 312,
        page: 1,
        sha256:
          "699aac0c9242350841ca2850f2b3b1b00f4a5225d22c96a4729fa9d6ad5fd537",
        src: "/generated/templates/business-card-violet-founder-1.png",
        width: 482,
      },
      {
        fixture: "business-card-violet-founder-example",
        height: 312,
        page: 2,
        sha256:
          "2e8504a85285537a61c0e790e735e12b35a352d3db0ec497331c0be3d53aa1e9",
        src: "/generated/templates/business-card-violet-founder-2.png",
        width: 482,
      },
    ],
    pdf: {
      revision:
        "4b00df93dba82bda48880f4e72666c62a93ffa91a1db2a8c7455f395a7eed9b4",
      src: "/generated/templates/business-card-violet-founder.pdf",
    },
    thumbnail: {
      fixture: "business-card-violet-founder-example",
      height: 312,
      page: 1,
      sha256:
        "699aac0c9242350841ca2850f2b3b1b00f4a5225d22c96a4729fa9d6ad5fd537",
      src: "/generated/templates/business-card-violet-founder-1.png",
      width: 482,
    },
  },
] as const satisfies readonly TemplateCatalogEntry[];
