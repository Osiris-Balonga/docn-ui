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
      pages.push({
        text: content.items
          .filter(
            (item): item is typeof item & { str: string } => "str" in item,
          )
          .map((item) => item.str)
          .join(" "),
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
    await retain("label-address-sheet", bytes);
  });
});
