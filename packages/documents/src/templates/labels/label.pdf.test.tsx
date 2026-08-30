import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  type RenderRequest,
} from "../../core/contracts";
import { resolveFormat } from "../../core/formats";
import { renderDocumentInNode } from "../../render/node";
import { addressLabelExample, createLabelAddressPlan } from "./label-address";
import {
  createLabelInventoryPlan,
  inventoryLabelExample,
} from "./label-inventory";
import { createLabelProductPlan, productLabelExample } from "./label-product";
import type { LabelData } from "./schema";

function request(
  data: LabelData,
  templateId: string,
  formatId: RenderRequest["formatId"],
  themeId: RenderRequest["themeId"] = "neutral",
): RenderRequest<LabelData> {
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

async function inspect(pdfBytes: Uint8Array) {
  const task = getDocument({ data: pdfBytes.slice(), useSystemFonts: false });
  try {
    const pdf = await task.promise;
    const pages = [];
    for (let index = 1; index <= pdf.numPages; index += 1) {
      const page = await pdf.getPage(index);
      const content = await page.getTextContent();
      const height = (page.view[3] ?? 0) - (page.view[1] ?? 0);
      const items = content.items.filter(
        (
          item,
        ): item is typeof item & {
          height: number;
          str: string;
          transform: number[];
        } => "str" in item && "height" in item && "transform" in item,
      );
      pages.push({
        items: items.map((item) => ({
          str: item.str,
          x: item.transform[4] ?? 0,
          y: height - (item.transform[5] ?? 0) - item.height,
        })),
        text: items.map((item) => item.str).join(" "),
        view: page.view,
      });
    }
    return { pageCount: pdf.numPages, pages };
  } finally {
    await task.destroy();
  }
}

async function retain(name: string, bytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../../.artifacts/l10/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}${name}.pdf`, bytes);
}

describe("label documents", () => {
  it("renders the three individual compositions at their physical label sizes", async () => {
    const fixtures = [
      {
        name: "label-product",
        formatId: "label-70x37" as const,
        expected: ["Studio Notebook", "REF NB-A5-042"],
        plan: createLabelProductPlan(
          request(productLabelExample, "label-product", "label-70x37"),
        ).plan,
      },
      {
        name: "label-address",
        formatId: "label-100x50" as const,
        expected: ["Maya Kanza", "42 rue de la Corniche"],
        plan: createLabelAddressPlan(
          request(
            addressLabelExample,
            "label-address",
            "label-100x50",
            "editorial",
          ),
        ).plan,
      },
      {
        name: "label-inventory",
        formatId: "label-100x50" as const,
        expected: ["AST-2048", "Studio B"],
        plan: createLabelInventoryPlan(
          request(
            inventoryLabelExample,
            "label-inventory",
            "label-100x50",
            "bold",
          ),
        ).plan,
      },
    ];

    for (const fixture of fixtures) {
      const bytes = await renderDocumentInNode(fixture.plan);
      const result = await inspect(bytes);
      const format = resolveFormat(fixture.formatId);
      if (format.kind !== "fixed")
        throw new Error("Expected a fixed label format.");
      expect(result.pageCount).toBe(1);
      expect(result.pages[0]?.view[2]).toBeCloseTo(format.trim.widthPt, 1);
      expect(result.pages[0]?.view[3]).toBeCloseTo(format.trim.heightPt, 1);
      for (const text of fixture.expected)
        expect(result.pages[0]?.text).toContain(text);
      await retain(fixture.name, bytes);
    }
  });

  it("renders an ordered partial A4 sheet across two pages", async () => {
    const labels = Array.from({ length: 4 }, (_, index) => ({
      ...addressLabelExample.labels[0],
      id: `recipient-${index + 1}`,
      title: `Recipient ${index + 1}`,
    }));
    const data: LabelData = {
      labels,
      export: {
        mode: "sheet",
        pageFormatId: "a4",
        marginsMm: { top: 10, right: 0, bottom: 10, left: 0 },
        columnGapMm: 0,
        rowGapMm: 2,
        startingCell: 19,
        quantity: 4,
      },
    };
    const bytes = await renderDocumentInNode(
      createLabelAddressPlan(request(data, "label-address", "label-70x37"))
        .plan,
    );
    const result = await inspect(bytes);
    const a4 = resolveFormat("a4");
    if (a4.kind !== "fixed") throw new Error("Expected a fixed A4 format.");
    expect(result.pageCount).toBe(2);
    for (const page of result.pages) {
      expect(page.view[2]).toBeCloseTo(a4.trim.widthPt, 1);
      expect(page.view[3]).toBeCloseTo(a4.trim.heightPt, 1);
    }
    expect(result.pages[0]?.text).toContain("Recipient 1");
    expect(result.pages[0]?.text).toContain("Recipient 2");
    expect(result.pages[1]?.text).toContain("Recipient 3");
    expect(result.pages[1]?.text).toContain("Recipient 4");
    const expectedTitles = [
      {
        page: 0,
        title: "Recipient 1",
        xMm: 73,
        minimumYMm: 247,
        maximumYMm: 270,
      },
      {
        page: 0,
        title: "Recipient 2",
        xMm: 143,
        minimumYMm: 247,
        maximumYMm: 270,
      },
      { page: 1, title: "Recipient 3", xMm: 3, minimumYMm: 13, maximumYMm: 36 },
      {
        page: 1,
        title: "Recipient 4",
        xMm: 73,
        minimumYMm: 13,
        maximumYMm: 36,
      },
    ];
    const mmToPt = (value: number) => (value * 72) / 25.4;
    for (const expected of expectedTitles) {
      const matches =
        result.pages[expected.page]?.items.filter(
          (item) => item.str === expected.title,
        ) ?? [];
      expect(matches).toHaveLength(1);
      expect(matches[0]?.x).toBeCloseTo(mmToPt(expected.xMm), 0);
      expect(matches[0]?.y).toBeGreaterThanOrEqual(mmToPt(expected.minimumYMm));
      expect(matches[0]?.y).toBeLessThan(mmToPt(expected.maximumYMm));
    }
    await retain("label-address-sheet", bytes);
  });
});
