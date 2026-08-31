const root = "packages/documents/src/primitives/";
const pdfDependencies = ["@react-pdf/renderer@4.9.0", "react@19.2.8"];

function component(
  id,
  title,
  files,
  registryDependencies,
  dependencies = pdfDependencies,
) {
  return {
    name: `docn-${id}`,
    type: "registry:component",
    title,
    description: `Source-owned PDF ${title} component. Requires a qualified PDF theme where applicable.`,
    dependencies,
    devDependencies: [
      "@types/react@19.2.18",
      ...(id === "qr-code" ? ["@types/qrcode@1.5.6"] : []),
    ],
    registryDependencies,
    files: files.map((file) => `${root}${file}`),
    preview: files.map((file) => `${root}${file}`),
    component: { name: title, source: `${root}${files[0]}` },
  };
}

export const componentRegistryItems = [
  component(
    "text",
    "Text",
    ["text.tsx", "link-validation.ts"],
    ["docn-theme-context", "docn-contracts"],
  ),
  component("heading", "Heading", ["heading.tsx"], ["docn-text"]),
  component("key-value", "KeyValue", ["field-pair.tsx"], ["docn-text"]),
  component("stack", "Stack", ["stack.tsx"], ["docn-theme-context"]),
  component("row", "Row", ["row.tsx"], ["docn-stack"]),
  component("divider", "Divider", ["separator.tsx"], ["docn-stack"]),
  component(
    "section",
    "Section",
    ["section.tsx"],
    ["docn-stack", "docn-heading"],
  ),
  component("card", "Card", ["card.tsx"], ["docn-section"]),
  component("link", "Link", ["link.tsx"], ["docn-text"]),
  component("list", "List", ["list.tsx", "list-data.ts"], ["docn-text"]),
  component(
    "image",
    "Image",
    ["image.tsx", "image-validation.ts"],
    ["docn-text"],
  ),
  component(
    "qr-code",
    "QRCode",
    ["qr-code-view.tsx", "qr-code.ts"],
    ["docn-contracts"],
    [...pdfDependencies, "qrcode@1.5.4"],
  ),
  component(
    "page-frame",
    "PageFrame",
    ["page-frame.tsx"],
    ["docn-theme-context", "docn-flow-geometry", "docn-page-geometry"],
  ),
  component(
    "document-frame",
    "DocumentFrame",
    ["document-frame.tsx"],
    ["docn-theme-context", "docn-flow-geometry"],
  ),
  component(
    "keep-together",
    "KeepTogether",
    ["keep-together.tsx"],
    ["docn-flow-geometry"],
  ),
  component(
    "page-break",
    "PageBreak",
    ["page-break.tsx"],
    ["docn-flow-geometry"],
  ),
  component("page-number", "PageNumber", ["page-number.tsx"], ["docn-text"]),
  component(
    "page-header",
    "PageHeader",
    ["page-header.tsx"],
    ["docn-row", "docn-image"],
  ),
  component(
    "page-footer",
    "PageFooter",
    ["page-footer.tsx"],
    ["docn-row", "docn-page-number"],
  ),
  component(
    "table",
    "Table",
    ["composable-table.tsx", "table.tsx", "table-data.ts"],
    ["docn-flow-geometry", "docn-theme-context"],
  ),
  component(
    "data-table",
    "DataTable",
    ["data-table.tsx"],
    ["docn-table", "docn-text"],
  ),
  component(
    "alert",
    "Alert",
    ["alert.tsx"],
    ["docn-text", "docn-printable-data"],
  ),
  component(
    "badge",
    "Badge",
    ["badge.tsx"],
    ["docn-text", "docn-printable-data"],
  ),
  component(
    "form",
    "Form",
    ["form.tsx"],
    ["docn-heading", "docn-printable-data"],
  ),
  component(
    "signature",
    "Signature",
    ["signature.tsx"],
    ["docn-text", "docn-printable-data"],
  ),
  component(
    "watermark",
    "Watermark",
    ["watermark.tsx", "watermark-layout.ts"],
    ["docn-flow-geometry", "docn-theme-context", "docn-printable-data"],
  ),
  component(
    "graph",
    "Graph",
    [
      "graph.tsx",
      "graph-data.ts",
      "graph-geometry.ts",
      "graph-layout.ts",
      "graph-text.tsx",
      "graph-cartesian.tsx",
      "graph-radial.tsx",
    ],
    ["docn-theme-context"],
  ),
  component(
    "barcode",
    "Barcode",
    ["barcode.tsx", "barcode-data.ts"],
    ["docn-theme-context"],
    [...pdfDependencies, "jsbarcode@3.12.3"],
  ),
];

// Shared table layout/data are relevant to reading DataTable, not a repository tree.
componentRegistryItems
  .find((item) => item.name === "docn-data-table")
  .preview.push(
    `${root}composable-table.tsx`,
    `${root}table-data.ts`,
    `${root}table.tsx`,
  );

export const primitiveSupportItems = [
  {
    name: "docn-flow-geometry",
    type: "registry:lib",
    title: "Flow geometry",
    description:
      "Physical safe frames and shared flow context, without a rendering pipeline.",
    dependencies: ["react@19.2.8"],
    registryDependencies: ["docn-contracts"],
    files: ["measurement.ts", "flow-layout.ts", "flow-context.tsx"].map(
      (file) => `${root}${file}`,
    ),
  },
  {
    name: "docn-printable-data",
    type: "registry:lib",
    title: "Printable data",
    description: "Shared validation for printable forms and annotations.",
    dependencies: [],
    registryDependencies: ["docn-contracts"],
    files: [`${root}printable-data.ts`],
  },
];
