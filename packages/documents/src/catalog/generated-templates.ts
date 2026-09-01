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
          "2aca1b6cbaa0eebcc4db7febf2ed0b284c3b9e9e8e8bdab0110247481dbefd9c",
        src: "/generated/templates/invoice-photo-header-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "e20451e567bdc5c35c03bf312d77eb73383b05edd15fad3237eb1aec52a17b82",
      src: "/generated/templates/invoice-photo-header.pdf",
    },
    thumbnail: {
      fixture: "invoice-photo-header-example",
      height: 1684,
      page: 1,
      sha256:
        "2aca1b6cbaa0eebcc4db7febf2ed0b284c3b9e9e8e8bdab0110247481dbefd9c",
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
    supportedFormatIds: ["receipt-80"],
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
        height: 1078,
        page: 1,
        sha256:
          "c256cfdd743abfcca1361d1e04c3837d17eb4bec603261c5aaffda6dc04ab0fb",
        src: "/generated/templates/receipt-order-confirmation-1.png",
        width: 454,
      },
    ],
    pdf: {
      revision:
        "43d5a255109aa0b00b6275f871efedc1c83e29112af02bc96d51f995a7c6239a",
      src: "/generated/templates/receipt-order-confirmation.pdf",
    },
    thumbnail: {
      fixture: "receipt-order-confirmation-example",
      height: 1078,
      page: 1,
      sha256:
        "c256cfdd743abfcca1361d1e04c3837d17eb4bec603261c5aaffda6dc04ab0fb",
      src: "/generated/templates/receipt-order-confirmation-1.png",
      width: 454,
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
          "074e451b995a6618a9619cc846e178fc6b80559ceeaafc3a90c8f66715e25df3",
        src: "/generated/templates/receipt-product-barcode-1.png",
        width: 454,
      },
    ],
    pdf: {
      revision:
        "bd092fb52acd7c2fa8b79c48f643c7e7e0da5372ef0aaf1034af6e0f86abcd7a",
      src: "/generated/templates/receipt-product-barcode.pdf",
    },
    thumbnail: {
      fixture: "receipt-product-barcode-example",
      height: 567,
      page: 1,
      sha256:
        "074e451b995a6618a9619cc846e178fc6b80559ceeaafc3a90c8f66715e25df3",
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
          "63091f97f51bedcdab8dc5d46053a6e441c90bb72c44d178f720f89fe80ed640",
        src: "/generated/templates/receipt-cash-register-1.png",
        width: 454,
      },
    ],
    pdf: {
      revision:
        "d9d512d02f7d9cdefe919852f7b9f9e930ae0706d2a060aaf9aa32560485b987",
      src: "/generated/templates/receipt-cash-register.pdf",
    },
    thumbnail: {
      fixture: "receipt-cash-register-example",
      height: 806,
      page: 1,
      sha256:
        "63091f97f51bedcdab8dc5d46053a6e441c90bb72c44d178f720f89fe80ed640",
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
          "0b00f31feff35c0a4dbcc05cd5236a569ca731c55624f2ee8b7cd182de5ccd7c",
        src: "/generated/templates/report-product-analytics-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "5b87e0e80745dd99479a7d626f0999fda3c79f60baf205edc825f547a1b8771b",
      src: "/generated/templates/report-product-analytics.pdf",
    },
    thumbnail: {
      fixture: "report-product-analytics-example",
      height: 1684,
      page: 1,
      sha256:
        "0b00f31feff35c0a4dbcc05cd5236a569ca731c55624f2ee8b7cd182de5ccd7c",
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
          "10cbd9032e8d639621ca26be210d7590443c1818fa7980adf2a2f77376c9ff52",
        src: "/generated/templates/report-marketplace-revenue-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "3ec1640e9206f57f9ecdba3a55ed858c9ae3fa755c8ebf42867c5bad3987ed6c",
      src: "/generated/templates/report-marketplace-revenue.pdf",
    },
    thumbnail: {
      fixture: "report-marketplace-revenue-example",
      height: 1684,
      page: 1,
      sha256:
        "10cbd9032e8d639621ca26be210d7590443c1818fa7980adf2a2f77376c9ff52",
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
          "f7fea8a4e45e53e138ae993afbb5adcbeacf5f448900ea58b63e1eac4e9e338c",
        src: "/generated/templates/report-customer-support-1.png",
        width: 1191,
      },
    ],
    pdf: {
      revision:
        "2075774c5707a57dcc99b52b158fda4ff3bd2f0063dfbcdce5da5d07de429b9e",
      src: "/generated/templates/report-customer-support.pdf",
    },
    thumbnail: {
      fixture: "report-customer-support-example",
      height: 1684,
      page: 1,
      sha256:
        "f7fea8a4e45e53e138ae993afbb5adcbeacf5f448900ea58b63e1eac4e9e338c",
      src: "/generated/templates/report-customer-support-1.png",
      width: 1191,
    },
  },
  {
    id: "badge-profile-lanyard",
    slug: "badge-profile-lanyard",
    title: "Profile lanyard badge",
    family: "badge",
    familyLabel: "Badges",
    description:
      "A two-sided portrait employee badge with a clean white face and a dedicated dark brand reverse.",
    supportedFormatIds: ["badge-54x86"],
    supportedThemeIds: ["neutral"],
    tags: ["badge", "employee", "portrait", "two-sided"],
    version: "1.0.0",
    sides: 2,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: false,
    },
    pages: [
      {
        fixture: "badge-profile-lanyard-example",
        height: 486,
        page: 1,
        sha256:
          "30928edd959ce8cf2cdffb7cbfa136577afd58de7c4e1edd304846cb57ca092f",
        src: "/generated/templates/badge-profile-lanyard-1.png",
        width: 307,
      },
      {
        fixture: "badge-profile-lanyard-example",
        height: 486,
        page: 2,
        sha256:
          "a1f948dfe8a4fbeb2b46df626139121f25789ab816b017aff90e42b9ff32a3b3",
        src: "/generated/templates/badge-profile-lanyard-2.png",
        width: 307,
      },
    ],
    pdf: {
      revision:
        "a4e726c93e53431519d6277a93e19104a0e6e71a018003e31e9d332a596f7780",
      src: "/generated/templates/badge-profile-lanyard.pdf",
    },
    thumbnail: {
      fixture: "badge-profile-lanyard-example",
      height: 486,
      page: 1,
      sha256:
        "30928edd959ce8cf2cdffb7cbfa136577afd58de7c4e1edd304846cb57ca092f",
      src: "/generated/templates/badge-profile-lanyard-1.png",
      width: 307,
    },
  },
  {
    id: "badge-qr-portrait-light",
    slug: "badge-qr-portrait-light",
    title: "Light QR portrait badge",
    family: "badge",
    familyLabel: "Badges",
    description:
      "A light portrait credential with a prominent QR code and an edge-to-edge header field.",
    supportedFormatIds: ["badge-54x86"],
    supportedThemeIds: ["neutral"],
    tags: ["badge", "employee", "portrait", "qr", "light"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: true,
    },
    pages: [
      {
        fixture: "badge-qr-portrait-light-example",
        height: 486,
        page: 1,
        sha256:
          "f3d806d25d7b7f041d092e0049bb937e07852b0f07edb2ff9742321c0f12a4ee",
        src: "/generated/templates/badge-qr-portrait-light-1.png",
        width: 307,
      },
    ],
    pdf: {
      revision:
        "73212b35c9dc296352f777c5a641fdab5f9c97da51112d18dc84c152384d2bd8",
      src: "/generated/templates/badge-qr-portrait-light.pdf",
    },
    thumbnail: {
      fixture: "badge-qr-portrait-light-example",
      height: 486,
      page: 1,
      sha256:
        "f3d806d25d7b7f041d092e0049bb937e07852b0f07edb2ff9742321c0f12a4ee",
      src: "/generated/templates/badge-qr-portrait-light-1.png",
      width: 307,
    },
  },
  {
    id: "badge-qr-portrait-blue",
    slug: "badge-qr-portrait-blue",
    title: "Blue QR portrait badge",
    family: "badge",
    familyLabel: "Badges",
    description:
      "A portrait credential with a QR code and an original abstract background extending to every page edge.",
    supportedFormatIds: ["badge-54x86"],
    supportedThemeIds: ["neutral"],
    tags: ["badge", "employee", "portrait", "qr", "blue", "full-bleed"],
    version: "1.0.0",
    sides: 1,
    capabilities: {
      logo: false,
      printProfiles: true,
      qr: true,
    },
    pages: [
      {
        fixture: "badge-qr-portrait-blue-example",
        height: 486,
        page: 1,
        sha256:
          "457f751c962bfc4106721d5487800ca58ea5c1c012aa3ca93a16de8e7aa72dcc",
        src: "/generated/templates/badge-qr-portrait-blue-1.png",
        width: 307,
      },
    ],
    pdf: {
      revision:
        "868cd710b1bf41d018e572e0a50a945257a439ec184d912c61fac5c31d342b65",
      src: "/generated/templates/badge-qr-portrait-blue.pdf",
    },
    thumbnail: {
      fixture: "badge-qr-portrait-blue-example",
      height: 486,
      page: 1,
      sha256:
        "457f751c962bfc4106721d5487800ca58ea5c1c012aa3ca93a16de8e7aa72dcc",
      src: "/generated/templates/badge-qr-portrait-blue-1.png",
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
          "3af0aa29351c3439481a2fdedf24914bd45cd959f6869a0e33d95e41f72f11b3",
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
        "1c4c896cd7a7a90cbcf62466051af7b519968881fba04ccda61eda9bb610f572",
      src: "/generated/templates/business-card-coral-qr.pdf",
    },
    thumbnail: {
      fixture: "business-card-coral-qr-example",
      height: 284,
      page: 1,
      sha256:
        "3af0aa29351c3439481a2fdedf24914bd45cd959f6869a0e33d95e41f72f11b3",
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
          "7de20ffb23639c1f998f98e20bdffe9b89ea6c5656207f9686b18dc475e3654e",
        src: "/generated/templates/business-card-violet-founder-1.png",
        width: 482,
      },
      {
        fixture: "business-card-violet-founder-example",
        height: 312,
        page: 2,
        sha256:
          "9d6b6e0d07bb09ca664499af8158889ebb38bdde90558cb2d733d99b727835a4",
        src: "/generated/templates/business-card-violet-founder-2.png",
        width: 482,
      },
    ],
    pdf: {
      revision:
        "6e3297b05b526bf0526f3f2544db175a4b6c5e47e7195dcfd21d3cdb0808c9aa",
      src: "/generated/templates/business-card-violet-founder.pdf",
    },
    thumbnail: {
      fixture: "business-card-violet-founder-example",
      height: 312,
      page: 1,
      sha256:
        "7de20ffb23639c1f998f98e20bdffe9b89ea6c5656207f9686b18dc475e3654e",
      src: "/generated/templates/business-card-violet-founder-1.png",
      width: 482,
    },
  },
] as const satisfies readonly TemplateCatalogEntry[];
