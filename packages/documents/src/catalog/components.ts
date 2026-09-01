export interface ComponentCatalogEntry {
  slug: string;
  title: string;
  description: string;
  notes: string;
  exampleFile: string;
  exampleExport: string;
  height: number;
  recipes?: readonly {
    title: string;
    description: string;
    exampleExport: string;
  }[];
}

type ComponentRecipe = NonNullable<ComponentCatalogEntry["recipes"]>[number];
const componentRecipes: Partial<Record<string, readonly ComponentRecipe[]>> = {
  text: [
    {
      title: "Type hierarchy",
      description:
        "Combine body, label and caption sizes with explicit emphasis and muted supporting copy.",
      exampleExport: "TextExampleHierarchy",
    },
    {
      title: "Alignment",
      description:
        "Align operational, confirmation and reference copy without introducing layout wrappers.",
      exampleExport: "TextExampleAlignment",
    },
  ],
  heading: [
    {
      title: "Document hierarchy",
      description:
        "Use heading levels to establish document and section hierarchy.",
      exampleExport: "HeadingHierarchyExample",
    },
    {
      title: "Aligned headings",
      description:
        "Align short headings to match the surrounding document composition.",
      exampleExport: "HeadingAlignmentExample",
    },
  ],
  "key-value": [
    {
      title: "Vertical detail",
      description: "Place a label above a value for narrow regions.",
      exampleExport: "KeyValueVerticalExample",
    },
    {
      title: "Horizontal summary",
      description:
        "Keep labels and values aligned in wider invoice or metadata regions.",
      exampleExport: "KeyValueHorizontalExample",
    },
  ],
  stack: [
    {
      title: "Compact metadata",
      description: "Use a small token gap for closely related metadata.",
      exampleExport: "StackSpacingExample",
    },
    {
      title: "Horizontal distribution",
      description:
        "Switch direction and distribute children with the same spacing contract.",
      exampleExport: "StackAlignmentExample",
    },
  ],
  row: [
    {
      title: "Distributed summary",
      description: "Place a reference and amount at opposite ends of one line.",
      exampleExport: "RowDistributionExample",
    },
    {
      title: "Centered sequence",
      description: "Center a short sequence with consistent theme spacing.",
      exampleExport: "RowCenteredExample",
    },
  ],
  section: [
    {
      title: "Titled section",
      description: "Group content under the built-in level-three heading.",
      exampleExport: "SectionTitledExample",
    },
    {
      title: "Untitled compact section",
      description:
        "Use Section for spacing even when the content supplies its own label.",
      exampleExport: "SectionUntitledExample",
    },
  ],
  card: [
    {
      title: "Summary card",
      description: "Frame related project information with an explicit title.",
      exampleExport: "CardSummaryExample",
    },
    {
      title: "Amount card",
      description: "Use compact padding for a short financial summary.",
      exampleExport: "CardAmountExample",
    },
  ],
  link: [
    {
      title: "External link",
      description: "Create a readable HTTP or HTTPS annotation.",
      exampleExport: "LinkExternalExample",
    },
    {
      title: "Contact links",
      description:
        "Expose email and telephone actions supported by PDF readers.",
      exampleExport: "LinkContactExample",
    },
    {
      title: "Internal destination",
      description: "Link to an explicit destination ID inside the document.",
      exampleExport: "LinkInternalExample",
    },
  ],
  list: [
    {
      title: "Nested bullets",
      description: "Combine descriptions and bounded nested items.",
      exampleExport: "ListBulletExample",
    },
    {
      title: "Ordered steps",
      description: "Present a short sequence with numbered markers.",
      exampleExport: "ListNumberedExample",
    },
    {
      title: "Static checklist",
      description:
        "Print completed and incomplete states without implying interactive fields.",
      exampleExport: "ListChecklistExample",
    },
  ],
  image: [
    {
      title: "Square photograph",
      description:
        "Preserve a permitted local photograph inside an explicit square box.",
      exampleExport: "ImageSquareExample",
    },
    {
      title: "Covered photograph",
      description:
        "Crop a real local photograph to fill a shorter landscape frame.",
      exampleExport: "ImageCoveredExample",
    },
    {
      title: "Rounded photograph",
      description:
        "Crop a permitted local photograph into a circle with a bounded radius.",
      exampleExport: "ImageRoundedExample",
    },
  ],
  "qr-code": [
    {
      title: "URL QR code",
      description: "Pair a scannable URL with a human-readable action label.",
      exampleExport: "QRCodeUrlExample",
    },
    {
      title: "Document reference",
      description:
        "Encode a bounded local reference at an explicit physical size.",
      exampleExport: "QRCodeReferenceExample",
    },
  ],
  "page-frame": [
    {
      title: "Business-card page",
      description: "Compose a fixed 85 × 55 mm physical page.",
      exampleExport: "PageFrameCardExample",
    },
    {
      title: "Event-ticket page",
      description: "Reuse the same frame contract for a 150 × 70 mm ticket.",
      exampleExport: "PageFrameTicketExample",
    },
  ],
  "document-frame": [
    {
      title: "Flow with reserved regions",
      description:
        "Let content paginate while preserving footer space on every page.",
      exampleExport: "DocumentFrameReservedRegionsExample",
    },
  ],
  "keep-together": [
    {
      title: "Measured non-breaking group",
      description:
        "Move a bounded heading and its supporting copy together when a page is full.",
      exampleExport: "KeepTogetherMeasuredGroupExample",
    },
  ],
  "page-break": [
    {
      title: "New document section",
      description:
        "Start a second section on a fresh page while retaining one DocumentFrame.",
      exampleExport: "PageBreakSectionExample",
    },
  ],
  "page-number": [
    {
      title: "Current and total pages",
      description: "Resolve both page placeholders after pagination.",
      exampleExport: "PageNumberTotalExample",
    },
    {
      title: "Compact counter",
      description: "Use a concise centered counter in a reserved footer.",
      exampleExport: "PageNumberCompactExample",
    },
  ],
  "page-header": [
    {
      title: "Header with local logo",
      description:
        "Combine a permitted local image and heading inside a reserved repeated region.",
      exampleExport: "PageHeaderLogoExample",
    },
  ],
  "page-footer": [
    {
      title: "Footer without numbering",
      description:
        "Print legal or contact copy while explicitly disabling page numbers.",
      exampleExport: "PageFooterWithoutNumberExample",
    },
  ],
  table: [
    {
      title: "Manually composed quotation",
      description:
        "Author every row directly, including a custom subtotal and surrounding summary.",
      exampleExport: "TableQuotationExample",
    },
  ],
  "data-table": [
    {
      title: "Typed production rows",
      description:
        "Map a typed dataset through stable column and row functions.",
      exampleExport: "DataTableRowsExample",
    },
    {
      title: "Empty dataset",
      description:
        "Provide a specific printed empty-state message when no rows exist.",
      exampleExport: "DataTableEmptyExample",
    },
  ],
  alert: [
    {
      title: "Informational note",
      description: "Use the default Note status for contextual information.",
      exampleExport: "AlertNoteExample",
    },
    {
      title: "Review callout",
      description:
        "Name a review state explicitly rather than relying on color.",
      exampleExport: "AlertReviewExample",
    },
    {
      title: "Short warning",
      description: "Omit the optional description for a compact instruction.",
      exampleExport: "AlertWarningExample",
    },
  ],
  badge: [
    {
      title: "Compact statuses",
      description: "Print concise neutral and outline labels inline.",
      exampleExport: "BadgeCompactExample",
    },
    {
      title: "Regular statuses",
      description:
        "Increase the text size for a more prominent document state.",
      exampleExport: "BadgeRegularExample",
    },
  ],
  form: [
    {
      title: "Single-column fields",
      description: "Keep longer or handwritten values at full available width.",
      exampleExport: "FormSingleColumnExample",
    },
    {
      title: "Three-column details",
      description: "Group short date, method and reference fields on one row.",
      exampleExport: "FormMultiColumnExample",
    },
  ],
  signature: [
    {
      title: "Single signer",
      description:
        "Reserve one bounded area for a handwritten signature and date.",
      exampleExport: "SignatureSingleExample",
    },
    {
      title: "Inline approval",
      description:
        "Place one signer label beside its signing line and optional metadata.",
      exampleExport: "SignatureInlineExample",
    },
    {
      title: "Paired approval",
      description:
        "Place two stacked signer areas side by side with optional names, roles and date.",
      exampleExport: "SignaturePairedExample",
    },
  ],
  watermark: [
    {
      title: "Full-page diagonal mark",
      description:
        "Repeat a large, low-opacity diagonal label across flowing pages.",
      exampleExport: "WatermarkRepeatedExample",
    },
    {
      title: "Single-page placement",
      description: "Place a smaller top watermark on only the first page.",
      exampleExport: "WatermarkPlacementExample",
    },
  ],
  graph: [
    {
      title: "Cartesian charts",
      description: "Compare categorical values with bar and line geometry.",
      exampleExport: "GraphCartesianExample",
    },
    {
      title: "Circular charts",
      description: "Show non-negative shares with pie and donut geometry.",
      exampleExport: "GraphCircularExample",
    },
  ],
  barcode: [
    {
      title: "Code 128 reference",
      description: "Encode a bounded printable ASCII operational identifier.",
      exampleExport: "BarcodeCode128Example",
    },
    {
      title: "EAN-13 product code",
      description:
        "Render a supplied thirteen-digit value with a valid check digit.",
      exampleExport: "BarcodeEan13Example",
    },
    {
      title: "Machine-readable only",
      description:
        "Hide the optional human-readable value while retaining the vector symbol.",
      exampleExport: "BarcodeMachineOnlyExample",
    },
  ],
};

const componentEntries: readonly ComponentCatalogEntry[] = [
  {
    slug: "text",
    title: "Text",
    description: "Selectable text with explicit size, weight and tone.",
    notes:
      "Use inside a PDF theme provider or frame. Defaults: body size, regular weight and default text tone. Text is not HTML; use document primitives for layout.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "TextExample",
    height: 245,
  },
  {
    slug: "heading",
    title: "Heading",
    description: "A consistent hierarchy for document titles and sections.",
    notes:
      "Use levels 1–3 or the existing display/heading size names. Levels control typography, not certified PDF accessibility tags.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "HeadingExample",
    height: 255,
  },
  {
    slug: "key-value",
    title: "KeyValue",
    description: "Readable label/value pairs for document details.",
    notes:
      "Defaults to vertical layout; horizontal gives the label one third of the row. FieldPair is the same implementation.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "KeyValueExample",
    height: 205,
  },
  {
    slug: "stack",
    title: "Stack",
    description: "Vertical layout with theme-based spacing.",
    notes:
      "Defaults to a vertical direction and md gap. Spacing tokens resolve to PDF points, not CSS classes.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "StackExample",
    height: 210,
  },
  {
    slug: "row",
    title: "Row",
    description: "Horizontal composition with alignment and spacing.",
    notes:
      "Composes Stack with a horizontal direction. Give flexible children suitable widths when content is long.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "RowExample",
    height: 165,
  },
  {
    slug: "divider",
    title: "Divider",
    description: "A quiet rule between related sections.",
    notes:
      "Divider and Separator are the same implementation. Line styles remain PDF-native; tones resolve through the active document theme rather than site CSS.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "DividerExample",
    height: 260,
    recipes: [
      {
        title: "Solid, dashed and dotted rules",
        description:
          "Choose a PDF-native line style without changing the surrounding layout.",
        exampleExport: "DividerLineStylesExample",
      },
      {
        title: "Centered label",
        description:
          "Split the rule around a short semantic label such as OR or a section marker.",
        exampleExport: "DividerLabelExample",
      },
      {
        title: "Emphasized partial rule",
        description:
          "Combine a theme tone, explicit thickness and bounded width for hierarchy.",
        exampleExport: "DividerEmphasisExample",
      },
    ],
  },
  {
    slug: "section",
    title: "Section",
    description: "A logical content group with an optional heading.",
    notes:
      "The optional title uses Heading level 3; the default gap is md. It does not force a new page.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "SectionExample",
    height: 245,
  },
  {
    slug: "card",
    title: "Card",
    description: "A framed group of related PDF content.",
    notes:
      "Defaults to md padding and Section spacing. This is a PDF View, not the site's shadcn Card.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "CardExample",
    height: 260,
  },
  {
    slug: "link",
    title: "Link",
    description: "Selectable links inside a PDF document.",
    notes:
      "Use validated https/http, mailto, tel or explicit internal destinations. Links default to blue; text and theme-accent tones are available. Reader support varies; links do not make tickets secure.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "LinkExample",
    height: 220,
  },
  {
    slug: "list",
    title: "List",
    description: "Bullets, numbering and static checklist items.",
    notes:
      "Defaults to bullet markers. Items may include descriptions and bounded nesting. Check states are printed marks, not interactive inputs.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "ListExample",
    height: 350,
  },
  {
    slug: "image",
    title: "Image",
    description: "A permitted local image with controlled dimensions.",
    notes:
      "Provide a resolved data or blob source, dimensions in points and alternative text. Arbitrary remote URLs are rejected. The sample source is supplied by the preview renderer.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "ImageExample",
    height: 390,
  },
  {
    slug: "qr-code",
    title: "QRCode",
    description: "A vector QR code with a protected quiet zone.",
    notes:
      "Size is in PDF points and includes the four-module quiet zone. Defaults: dark modules on white, minimum module size 1 pt. Dense payloads are rejected; this is not ticket verification.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "QRCodeExample",
    height: 175,
  },
  {
    slug: "page-frame",
    title: "PageFrame",
    description: "A fixed physical page with a safe content area.",
    notes:
      "Takes a resolved fixed format and PDF theme. The default screen profile has no bleed. Print profiles may add bleed/crop marks; no PDF/X or CMYK certification.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "PageFrameExample",
    height: 0,
  },
  {
    slug: "document-frame",
    title: "DocumentFrame",
    description: "Flowing pages with reserved header and footer space.",
    notes:
      "Supports portrait A4 and Letter only. Margins default to the format safe area; explicit margins must preserve it. Header/footer heights and optional gaps are points. Ensure content fits the declared regions; continuous receipt formats use their separate family pipeline.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "DocumentFrameExample",
    height: 0,
  },
  {
    slug: "keep-together",
    title: "KeepTogether",
    description: "Keep a measured content group on one page.",
    notes:
      "Requires DocumentFrame and an explicit measuredHeight in points. Oversized groups are rejected. Authors must qualify the declared height against their actual content and fonts.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "KeepTogetherExample",
    height: 0,
  },
  {
    slug: "page-break",
    title: "PageBreak",
    description: "Start the next section on a new page.",
    notes:
      "Place inside DocumentFrame. This is an explicit flow break, not an extra fixed-format template or a blank page API.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "PageBreakExample",
    height: 0,
  },
  {
    slug: "page-number",
    title: "PageNumber",
    description: "Current and final page counts resolved after pagination.",
    notes:
      "Defaults to “Page {page} of {pages}”, right-aligned. The format must contain {page}; {pages} is optional. Other placeholders are rejected.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "PageNumberExample",
    height: 110,
  },
  {
    slug: "page-header",
    title: "PageHeader",
    description: "A reusable header with optional resolved logo.",
    notes:
      "Place in DocumentFrame.header to repeat with reserved space. Its height must accommodate the chosen content; the component does not reserve page space on its own.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "PageHeaderExample",
    height: 0,
  },
  {
    slug: "page-footer",
    title: "PageFooter",
    description: "Contact details and a page number at the foot of a page.",
    notes:
      "Place in DocumentFrame.footer for repetition. Page numbering is enabled by default; pass pageNumber={false} to hide it.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "PageFooterExample",
    height: 0,
  },
  {
    slug: "table",
    title: "Table",
    description: "Composable table headers, rows and cells.",
    notes:
      "Requires DocumentFrame. Column widths are percentages totaling 100. Compose TableHeader separately, including in a repeated page header. Each TableRow needs a measured height and one direct TableCell per column, in order.",
    exampleFile: "packages/documents/src/examples/components/data.tsx",
    exampleExport: "TableExample",
    height: 0,
  },
  {
    slug: "data-table",
    title: "DataTable",
    description: "A typed table derived from rows and column functions.",
    notes:
      "Requires DocumentFrame. Provide stable row keys and measured row heights. Columns use percentages totaling 100. Compose TableHeader explicitly; empty data displays the configured message.",
    exampleFile: "packages/documents/src/examples/components/data.tsx",
    exampleExport: "DataTableExample",
    height: 0,
  },
  {
    slug: "alert",
    title: "Alert",
    description: "A labeled callout for important document information.",
    notes:
      "The default status is Note. Status and title are explicit text rather than color-only meaning. This is static printed content.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "AlertExample",
    height: 285,
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Compact status labels that print clearly.",
    notes:
      "Defaults to compact size and neutral tone. Outline and regular-size variants use the same theme tokens. Labels are bounded to 48 characters.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "BadgeExample",
    height: 170,
  },
  {
    slug: "form",
    title: "Form",
    description: "Printable fields arranged in one, two or three columns.",
    notes:
      "Groups default to one column. Values may be filled or left blank; required adds a printed label only. These are not interactive AcroForm fields. Qualify long field values at the actual column width.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "FormExample",
    height: 390,
  },
  {
    slug: "signature",
    title: "Signature",
    description: "Single or paired areas for a handwritten signature.",
    notes:
      "Defaults to stacked layout and 40 pt signing space. At most two signers, with optional name, role and date. No cryptographic signature or identity verification.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "SignatureExample",
    height: 310,
  },
  {
    slug: "watermark",
    title: "Watermark",
    description: "A controlled text mark behind document content.",
    notes:
      "Place directly inside DocumentFrame, after body content. Defaults: center, 0.08 opacity, 32 pt, repeated. Rotation and larger display sizes support familiar full-page diagonal marks; this is not document protection.",
    exampleFile: "packages/documents/src/examples/components/frames.tsx",
    exampleExport: "WatermarkExample",
    height: 0,
  },
  {
    slug: "graph",
    title: "Graph",
    description: "PDF-native charts from bounded categorical data.",
    notes:
      "Supports bar, horizontal-bar, line, area, pie and donut. One categorical series, monochrome theme defaults, short labels and finite values. Dense labels and unreadable sectors fail explicitly; no canvas screenshots or interactive charts.",
    exampleFile: "packages/documents/src/examples/components/data.tsx",
    exampleExport: "GraphExample",
    height: 1110,
  },
  {
    slug: "barcode",
    title: "Barcode",
    description: "Vector Code 128 and EAN-13 with validated dimensions.",
    notes:
      "Only Code 128 and EAN-13 are supported. EAN-13 requires a valid supplied check digit. Quiet zones and physical module/bar sizes are checked. Black on opaque white, independent of theme. No GS1 assignment or printer/scanner certification.",
    exampleFile: "packages/documents/src/examples/components/data.tsx",
    exampleExport: "BarcodeExample",
    height: 340,
  },
];

export const componentCatalog: readonly ComponentCatalogEntry[] =
  componentEntries
    .map((entry) => ({
      ...entry,
      recipes: entry.recipes ?? componentRecipes[entry.slug] ?? [],
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "en"));
