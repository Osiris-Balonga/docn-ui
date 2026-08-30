import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  type RenderRequest,
} from "../../core/contracts";
import { renderContinuousDocumentInNode } from "../../render/node";
import { millimetersToPoints } from "../../core/units";
import { DocumentValidationError } from "../../core/errors";
import {
  createReceiptHospitalityPlan,
  hospitalityReceiptExample,
} from "./receipt-hospitality";
import {
  createReceiptRetailPlan,
  retailReceiptExample,
} from "./receipt-retail";
import {
  createReceiptServicePlan,
  serviceReceiptExample,
} from "./receipt-service";
import type { ReceiptData } from "./schema";

function createRequest(
  data: ReceiptData,
  templateId: string,
  formatId: "receipt-58" | "receipt-80",
  themeId: RenderRequest["themeId"],
): RenderRequest<ReceiptData> {
  return {
    assetIds: [],
    data,
    formatId,
    locale: "en",
    printProfile: { kind: "screen" },
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
    revision: 1,
    templateId,
    templateVersion: "1.0.0",
    themeId,
  };
}

async function inspectReceipt(bytes: Uint8Array) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    return {
      pageCount: document.numPages,
      text: content.items
        .filter((item): item is typeof item & { str: string } => "str" in item)
        .map((item) => item.str)
        .join(" "),
      width: (page.view[2] ?? 0) - (page.view[0] ?? 0),
      height: (page.view[3] ?? 0) - (page.view[1] ?? 0),
    };
  } finally {
    await loadingTask.destroy();
  }
}

async function retainPdf(name: string, bytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../../.artifacts/l09/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}${name}.pdf`, bytes);
}

describe("thermal receipt compositions", () => {
  it("renders three distinct one-page receipts at their measured heights", async () => {
    const fixtures = [
      {
        artifact: "receipt-retail-58",
        plan: createReceiptRetailPlan(
          createRequest(
            retailReceiptExample,
            "receipt-retail",
            "receipt-58",
            "neutral",
          ),
        ).plan,
        text: ["Nzela Corner Store", "RCPT-2026-0042", "TOTAL"],
        width: 164.409_448_818_9,
      },
      {
        artifact: "receipt-hospitality-80",
        plan: createReceiptHospitalityPlan(
          createRequest(
            hospitalityReceiptExample,
            "receipt-hospitality",
            "receipt-80",
            "editorial",
          ),
        ).plan,
        text: ["M'Pila Table", "Table 08", "Service is included"],
        width: 226.771_653_543_3,
      },
      {
        artifact: "receipt-service-80",
        plan: createReceiptServicePlan(
          createRequest(
            serviceReceiptExample,
            "receipt-service",
            "receipt-80",
            "bold",
          ),
        ).plan,
        text: ["Northstar Cloud", "Common Form Studio", "Payment received"],
        width: 226.771_653_543_3,
      },
    ];

    for (const fixture of fixtures) {
      const bytes = await renderContinuousDocumentInNode(fixture.plan);
      const inspection = await inspectReceipt(bytes);
      expect(inspection.pageCount).toBe(1);
      expect(inspection.width).toBeCloseTo(fixture.width, 1);
      expect(inspection.height).toBeGreaterThan(100);
      expect(inspection.height).toBeLessThan(842);
      for (const expectedText of fixture.text)
        expect(inspection.text).toContain(expectedText);
      await retainPdf(fixture.artifact, bytes);
    }
  });

  it("keeps the total and footer on a long narrow receipt", async () => {
    const longReceipt = {
      ...retailReceiptExample,
      number: "RCPT-LONG-0099",
      lines: Array.from({ length: 80 }, (_, index) => ({
        id: `line-${index + 1}`,
        label: `Shelf item ${String(index + 1).padStart(2, "0")} with descriptive name`,
        quantity: (index % 3) + 1,
        unitPriceMinor: 500 + index * 25,
        taxRateBasisPoints: index % 4 === 0 ? 0 : 1800,
      })),
    } satisfies ReceiptData;
    const plan = createReceiptRetailPlan(
      createRequest(longReceipt, "receipt-retail", "receipt-58", "neutral"),
    ).plan;
    const bytes = await renderContinuousDocumentInNode(plan);
    const inspection = await inspectReceipt(bytes);

    expect(inspection.pageCount).toBe(1);
    expect(inspection.height).toBeGreaterThan(842);
    expect(inspection.height).toBeLessThan(5_669.291_338_582_7);
    expect(inspection.text).toContain("Shelf item 80");
    expect(inspection.text).toContain("TOTAL");
    expect(inspection.text).toContain("END · RCPT-LONG-0099");
    await retainPdf("receipt-retail-58-long", bytes);
  });

  it("reports the physical limit and renders again after content is corrected", async () => {
    const request = createRequest(
      retailReceiptExample,
      "receipt-retail",
      "receipt-58",
      "neutral",
    );
    const validPlan = createReceiptRetailPlan(request).plan;
    const constrainedPlan = {
      ...validPlan,
      format: {
        ...validPlan.format,
        maxHeightMm: 45,
        maxHeightPt: millimetersToPoints(45),
      },
    };

    try {
      await renderContinuousDocumentInNode(constrainedPlan);
      throw new Error("Expected constrained receipt rendering to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(DocumentValidationError);
      expect(error).toMatchObject({ code: "LAYOUT_OVERFLOW" });
      expect((error as Error).message).toContain(
        "Remove lines or shorten content, then render again.",
      );
    }

    const recovered = await inspectReceipt(
      await renderContinuousDocumentInNode(validPlan),
    );
    expect(recovered.pageCount).toBe(1);
    expect(recovered.text).toContain("TOTAL");
    expect(recovered.text).toContain("END · RCPT-2026-0042");
  });
});
