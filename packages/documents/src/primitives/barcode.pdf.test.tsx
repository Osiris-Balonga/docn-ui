import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { decodeBarcodeSpecimen } from "../../../../tooling/testing/barcode-pdf";
import {
  barcodeExamples,
  createPrimitiveBarcodesPlan,
} from "../examples/primitive-barcodes";
import { renderDocumentInNode } from "../render/node";

describe("final-PDF vector barcodes", () => {
  it("decodes both formats at nominal/minimum sizes, retaining leading zeroes and selectable captions", async () => {
    const bytes = await renderDocumentInNode(createPrimitiveBarcodesPlan());
    if (process.env.DOCN_WRITE_PDF_ARTIFACTS === "1") {
      const directory = fileURLToPath(
        new URL("../../../../.artifacts/l12/pdf/", import.meta.url),
      );
      await mkdir(directory, { recursive: true });
      await writeFile(`${directory}primitive-barcodes.pdf`, bytes);
    }
    expect(await decodeBarcodeSpecimen(bytes)).toEqual(
      barcodeExamples.map((example) => example.value),
    );
    const task = getDocument({ data: bytes.slice(), useSystemFonts: false });
    try {
      const pdf = await task.promise;
      expect(pdf.numPages).toBe(1);
      const page = await pdf.getPage(1);
      const content = await page.getTextContent();
      const items = content.items.filter((item) => "str" in item);
      const text = items.map((item) => item.str).join(" ");
      for (const example of barcodeExamples) {
        if (example.showValue) {
          expect(text).toContain(example.value);
          expect(
            items.find((item) => item.str === example.value)?.height,
          ).toBeCloseTo(7, 1);
        } else expect(text).not.toContain(example.value);
      }
      const operators = await page.getOperatorList();
      expect(operators.fnArray).toContain(OPS.constructPath);
      expect(operators.fnArray).not.toContain(OPS.paintImageXObject);
      expect(operators.fnArray).not.toContain(OPS.paintInlineImageXObject);
    } finally {
      await task.destroy();
    }
  });
});
