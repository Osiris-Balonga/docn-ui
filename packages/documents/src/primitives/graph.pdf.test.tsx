import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { createPrimitiveGraphsPlan } from "../examples/primitive-graphs";
import { renderDocumentInNode } from "../render/node";

describe("vector graph PDF specimen", () => {
  it("prints six labeled vector forms and explicit boundary states without raster images", async () => {
    const bytes = await renderDocumentInNode(createPrimitiveGraphsPlan());
    if (process.env.DOCN_WRITE_PDF_ARTIFACTS === "1") {
      const directory = fileURLToPath(
        new URL("../../../../.artifacts/l12/pdf/", import.meta.url),
      );
      await mkdir(directory, { recursive: true });
      await writeFile(`${directory}primitive-graphs.pdf`, bytes);
    }
    const task = getDocument({ data: bytes.slice(), useSystemFonts: false });
    try {
      const document = await task.promise;
      expect(document.numPages).toBe(2);
      const texts: string[] = [];
      for (let index = 1; index <= 2; index++) {
        const page = await document.getPage(index);
        const content = await page.getTextContent();
        const items = content.items.filter(
          (item) => "str" in item && item.str.trim(),
        );
        const text = items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        texts.push(text);
        for (const item of items) {
          if (!("str" in item)) continue;
          if (
            ["Jan", "Copies printed", "1. Jan: 32 (20.0%)", "No data"].includes(
              item.str,
            )
          )
            expect(item.height).toBeCloseTo(7, 1);
          expect(item.transform[4]).toBeGreaterThanOrEqual(35.9);
          expect(item.transform[4]! + item.width).toBeLessThanOrEqual(559.38);
          const top = page.view[3]! - item.transform[5]! - item.height;
          expect(top).toBeGreaterThanOrEqual(35.9);
          expect(top + item.height).toBeLessThanOrEqual(805.99);
        }
        const operators = await page.getOperatorList();
        expect(operators.fnArray).toContain(OPS.constructPath);
        expect(operators.fnArray).not.toContain(OPS.paintImageXObject);
        expect(operators.fnArray).not.toContain(OPS.paintInlineImageXObject);
      }
      for (const title of [
        "Vertical bars",
        "Horizontal bars",
        "Line graph",
        "Area graph",
        "Pie graph",
        "Donut graph",
      ])
        expect(texts[0]).toContain(title);
      expect(texts[0]!.match(/Copies printed/g)).toHaveLength(6);
      for (const category of ["Jan", "Feb", "Mar", "Apr"])
        expect(texts[0]!.match(new RegExp(category, "g"))).toHaveLength(6);
      expect(texts[0]!.match(/1\. Jan: 32 \(20.0%\)/g)).toHaveLength(2);
      expect(texts[0]!.match(/4\. Apr: 56 \(35.0%\)/g)).toHaveLength(2);
      for (const label of [
        "No data",
        "All-zero bars",
        "Signed values",
        "-10",
        "-20",
        "No positive values",
        "Single pie",
        "Single donut",
        "1. Print: 8 (100.0%)",
        "2. Digital: 0 (0.0%)",
      ])
        expect(texts[1]).toContain(label);
    } finally {
      await task.destroy();
    }
  });
});
