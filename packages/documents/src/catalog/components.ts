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

export const componentCatalog: readonly ComponentCatalogEntry[] = [
  {
    slug: "text",
    title: "Text",
    description: "Selectable text with explicit size, weight and tone.",
    notes:
      "Use inside a PDF theme provider or frame. Defaults: body size, regular weight and default text tone. Text is not HTML; use document primitives for layout.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "TextExample",
    height: 170,
  },
  {
    slug: "heading",
    title: "Heading",
    description: "A consistent hierarchy for document titles and sections.",
    notes:
      "Use levels 1–3 or the existing display/heading size names. Levels control typography, not certified PDF accessibility tags.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "HeadingExample",
    height: 190,
  },
  {
    slug: "key-value",
    title: "KeyValue",
    description: "Readable label/value pairs for document details.",
    notes:
      "Defaults to vertical layout; horizontal gives the label one third of the row. FieldPair is the same implementation.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "KeyValueExample",
    height: 170,
  },
  {
    slug: "stack",
    title: "Stack",
    description: "Vertical layout with theme-based spacing.",
    notes:
      "Defaults to a vertical direction and md gap. Spacing tokens resolve to PDF points, not CSS classes.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "StackExample",
    height: 190,
  },
  {
    slug: "row",
    title: "Row",
    description: "Horizontal composition with alignment and spacing.",
    notes:
      "Composes Stack with a horizontal direction. Give flexible children suitable widths when content is long.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "RowExample",
    height: 130,
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
    height: 185,
  },
  {
    slug: "card",
    title: "Card",
    description: "A framed group of related PDF content.",
    notes:
      "Defaults to md padding and Section spacing. This is a PDF View, not the site's shadcn Card.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "CardExample",
    height: 185,
  },
  {
    slug: "link",
    title: "Link",
    description: "Selectable links inside a PDF document.",
    notes:
      "Use validated https/http, mailto, tel or explicit internal destinations. Reader support varies; links do not make tickets secure.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "LinkExample",
    height: 155,
  },
  {
    slug: "list",
    title: "List",
    description: "Bullets, numbering and static checklist items.",
    notes:
      "Defaults to bullet markers. Items may include descriptions and bounded nesting. Check states are printed marks, not interactive inputs.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "ListExample",
    height: 190,
  },
  {
    slug: "image",
    title: "Image",
    description: "A permitted local image with controlled dimensions.",
    notes:
      "Provide a resolved data or blob source, dimensions in points and alternative text. Arbitrary remote URLs are rejected. The sample source is supplied by the preview renderer.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "ImageExample",
    height: 190,
  },
  {
    slug: "qr-code",
    title: "QRCode",
    description: "A vector QR code with a protected quiet zone.",
    notes:
      "Size is in PDF points and includes the four-module quiet zone. Defaults: dark modules on white, minimum module size 1 pt. Dense payloads are rejected; this is not ticket verification.",
    exampleFile: "packages/documents/src/examples/components/content.tsx",
    exampleExport: "QRCodeExample",
    height: 170,
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
    height: 165,
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Compact status labels that print clearly.",
    notes:
      "Defaults to compact size and neutral tone. Outline and regular-size variants use the same theme tokens. Labels are bounded to 48 characters.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "BadgeExample",
    height: 120,
  },
  {
    slug: "form",
    title: "Form",
    description: "Printable fields arranged in one, two or three columns.",
    notes:
      "Groups default to one column. Values may be filled or left blank; required adds a printed label only. These are not interactive AcroForm fields. Qualify long field values at the actual column width.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "FormExample",
    height: 230,
  },
  {
    slug: "signature",
    title: "Signature",
    description: "Single or paired areas for a handwritten signature.",
    notes:
      "Defaults to stacked layout and 40 pt signing space. At most two signers, with optional name, role and date. No cryptographic signature or identity verification.",
    exampleFile: "packages/documents/src/examples/components/annotations.tsx",
    exampleExport: "SignatureExample",
    height: 190,
  },
  {
    slug: "watermark",
    title: "Watermark",
    description: "A controlled text mark behind document content.",
    notes:
      "Place directly inside DocumentFrame, after body content. Defaults: center, 0.08 opacity, 32 pt, repeated. Short horizontal Latin labels only; not document protection.",
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
    height: 285,
  },
  {
    slug: "barcode",
    title: "Barcode",
    description: "Vector Code 128 and EAN-13 with validated dimensions.",
    notes:
      "Only Code 128 and EAN-13 are supported. EAN-13 requires a valid supplied check digit. Quiet zones and physical module/bar sizes are checked. Black on opaque white, independent of theme. No GS1 assignment or printer/scanner certification.",
    exampleFile: "packages/documents/src/examples/components/data.tsx",
    exampleExport: "BarcodeExample",
    height: 265,
  },
].sort((a, b) => a.title.localeCompare(b.title, "en"));
