import { Document, Page, Text, View } from "@react-pdf/renderer";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  type RenderRequest,
  type TemplateMetadata,
} from "../../core/contracts";
import { calculateMonetaryDocument, formatMinorAmount } from "../../core/money";
import {
  FlowTableCell,
  FlowTableHeader,
  FlowTableRow,
  type FlowTableColumn,
} from "../../primitives/table";
import { renderDocumentInNode } from "../../render/node";
import {
  businessInvoiceExample,
  createInvoiceBusinessPlan,
} from "./invoice-business";
import {
  createInvoiceMinimalPlan,
  minimalInvoiceExample,
} from "./invoice-minimal";
import {
  createInvoiceStudioPlan,
  studioInvoiceExample,
} from "./invoice-studio";
import { createInvoicePlan, type InvoiceDocumentProps } from "./plan";
import type { InvoiceData } from "./schema";

const metadata = {
  id: "invoice-foundation-test",
  version: "1.0.0",
  schemaVersion: 1,
  family: "invoice",
  title: "Invoice foundation test",
  description: "Internal pagination fixture.",
  tags: ["invoice"],
  supportedFormatIds: ["a4", "letter"],
  supportedThemeIds: ["neutral"],
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
} as const satisfies TemplateMetadata & Record<string, unknown>;

const columns = [
  { key: "description", label: "Description", width: "46%" },
  { align: "right", key: "quantity", label: "Qty", width: "12%" },
  { align: "right", key: "price", label: "Price", width: "20%" },
  { align: "right", key: "amount", label: "Amount", width: "22%" },
] as const satisfies readonly FlowTableColumn[];

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

function FoundationInvoiceDocument(props: InvoiceDocumentProps) {
  const totals = calculateMonetaryDocument(props.data.lines);
  return (
    <Document
      title={props.data.number}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
    >
      <Page
        size={[props.format.trim.widthPt, props.format.trim.heightPt]}
        style={{
          fontFamily: "Noto Sans",
          fontSize: 8,
          paddingBottom: 42,
          paddingHorizontal: 42,
          paddingTop: 78,
        }}
      >
        <View fixed style={{ left: 42, position: "absolute", top: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: 700 }}>
            {props.data.number}
          </Text>
        </View>
        <View
          fixed
          style={{ bottom: 20, left: 42, position: "absolute", right: 42 }}
        >
          <Text
            style={{ color: "#666666", fontSize: 7, textAlign: "right" }}
            render={({ pageNumber, totalPages }) =>
              `Invoice ${props.data.number} · ${pageNumber}/${totalPages}`
            }
          />
        </View>
        <FlowTableHeader
          backgroundColor="#f2f2f2"
          borderColor="#cccccc"
          columns={columns}
          color="#222222"
          top={48}
        />
        {props.data.lines.map((line, index) => (
          <FlowTableRow key={line.id} borderColor="#dddddd">
            <FlowTableCell width="46%">{line.label}</FlowTableCell>
            <FlowTableCell align="right" width="12%">
              {line.quantity}
            </FlowTableCell>
            <FlowTableCell align="right" width="20%">
              {formatMinorAmount(
                line.unitPriceMinor,
                props.data.currency,
                props.locale,
              )}
            </FlowTableCell>
            <FlowTableCell align="right" width="22%">
              {formatMinorAmount(
                totals.lines[index]?.totalMinor ?? 0,
                props.data.currency,
                props.locale,
              )}
            </FlowTableCell>
          </FlowTableRow>
        ))}
        <View wrap={false} style={{ alignSelf: "flex-end", marginTop: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: 700 }}>
            Grand total{" "}
            {formatMinorAmount(
              totals.totalMinor,
              props.data.currency,
              props.locale,
            )}
          </Text>
          <Text>SUMMARY-END</Text>
        </View>
      </Page>
    </Document>
  );
}

function request(data: InvoiceData): RenderRequest<InvoiceData> {
  return {
    assetIds: [],
    data,
    formatId: "a4",
    locale: "en",
    printProfile: { kind: "screen" },
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
    revision: 1,
    templateId: metadata.id,
    templateVersion: metadata.version,
    themeId: "neutral",
  };
}

function templateRequest(
  data: InvoiceData,
  templateId: "invoice-business" | "invoice-minimal" | "invoice-studio",
  formatId: "a4" | "letter",
  themeId: RenderRequest["themeId"],
): RenderRequest<InvoiceData> {
  return {
    ...request(data),
    formatId,
    templateId,
    themeId,
  };
}

async function extractPages(bytes: Uint8Array) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const pdf = await loadingTask.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .filter(
            (item): item is typeof item & { str: string } => "str" in item,
          )
          .map((item) => item.str)
          .join(" "),
      );
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
}

async function retainPdf(name: string, bytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../../.artifacts/l11/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}${name}.pdf`, bytes);
}

describe("invoice pagination foundation", () => {
  it("renders three distinct nominal invoices in A4 and Letter", async () => {
    const fixtures = [
      {
        artifact: "invoice-minimal-a4",
        expected: [
          "Atelier Nzela",
          "INV-2026-0042",
          "Identity system refinement",
        ],
        plan: createInvoiceMinimalPlan(
          templateRequest(
            minimalInvoiceExample,
            "invoice-minimal",
            "a4",
            "neutral",
          ),
        ).plan,
      },
      {
        artifact: "invoice-business-letter",
        expected: ["Kivu Advisory Group", "KA-2026-118", "Executive roadmap"],
        plan: createInvoiceBusinessPlan(
          templateRequest(
            businessInvoiceExample,
            "invoice-business",
            "letter",
            "editorial",
          ),
        ).plan,
      },
      {
        artifact: "invoice-studio-a4",
        expected: [
          "Northstar Cloud",
          "Common Form Studio",
          "NSC-2026-0830",
          "Northstar Pro workspace",
        ],
        plan: createInvoiceStudioPlan(
          templateRequest(studioInvoiceExample, "invoice-studio", "a4", "bold"),
        ).plan,
      },
    ];

    for (const fixture of fixtures) {
      const bytes = await renderDocumentInNode(fixture.plan);
      const pages = await extractPages(bytes);
      expect(pages).toHaveLength(1);
      for (const expected of fixture.expected)
        expect(pages[0]).toContain(expected);
      await retainPdf(fixture.artifact, bytes);
    }
  });

  it("repeats headers and preserves every row, footer, and final summary", async () => {
    const data = {
      seller: { name: "Atelier Nzela", address: ["14 avenue des Arts"] },
      customer: { name: "Common Form Studio", address: ["21 Market Street"] },
      number: "INV-LONG-2026-0099",
      issueDate: "2026-08-30",
      dueDate: "2026-09-29",
      currency: "EUR",
      lines: Array.from({ length: 80 }, (_, index) => ({
        id: `line-${index + 1}`,
        label: `Project line ${String(index + 1).padStart(3, "0")} with retained descriptive content`,
        quantity: (index % 3) + 1,
        unitPriceMinor: 10_000 + index * 125,
        taxRateBasisPoints: 2_000,
      })),
      legalFields: [],
    } satisfies InvoiceData;
    const plan = createInvoicePlan(request(data), metadata, (props) => (
      <FoundationInvoiceDocument {...props} />
    )).plan;
    const pages = await extractPages(await renderDocumentInNode(plan));

    expect(pages.length).toBeGreaterThan(1);
    for (const [index, page] of pages.entries()) {
      expect(page).toContain("DESCRIPTION");
      expect(page).toContain(
        `Invoice ${data.number} · ${index + 1}/${pages.length}`,
      );
      expect(page.trim()).not.toBe("");
    }
    const text = pages.join(" ");
    for (const line of data.lines) expect(text).toContain(line.label);
    expect(text).toContain("Grand total");
    expect(text).toContain("SUMMARY-END");
    expect(pages.at(-1)).toContain("SUMMARY-END");
  });

  it("keeps a long real invoice continuous through its final total", async () => {
    const longLabel =
      "Accessibility review and production-ready implementation guidance for the multilingual account statement component";
    const data = {
      ...businessInvoiceExample,
      number: "KA-LONG-2026-204",
      lines: Array.from({ length: 72 }, (_, index) => ({
        id: `workstream-${index + 1}`,
        label:
          index === 35
            ? longLabel
            : `Qualified workstream ${String(index + 1).padStart(3, "0")}`,
        quantity: 1,
        unitPriceMinor: 10_000,
        taxRateBasisPoints: 2_000,
      })),
    } satisfies InvoiceData;
    const plan = createInvoiceBusinessPlan(
      templateRequest(data, "invoice-business", "a4", "neutral"),
    ).plan;
    const bytes = await renderDocumentInNode(plan);
    const pages = await extractPages(bytes);

    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages) {
      expect(page).toContain("DESCRIPTION");
      expect(page).toContain(data.number);
      expect(page.trim()).not.toBe("");
    }
    const text = pages.join(" ");
    expect(text).toContain("Qualified workstream 001");
    expect(text).toContain("Qualified workstream 072");
    expect(text).toContain(longLabel);
    expect(pages.at(-1)).toContain("8,640.00 USD");
    expect(pages.at(-1)).toContain("Payment due within 15 days");
    await retainPdf("invoice-business-multipage", bytes);
  });
});
