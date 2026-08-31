import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { createPrimitiveFramesPlan } from "../examples/primitive-frames";
import { renderDocumentInNode } from "../render/node";

describe("shared PDF primitive frames", () => {
  it("uses one typography implementation across fixed and flowing pages with reserved regions", async () => {
    const bytes = await renderDocumentInNode(createPrimitiveFramesPlan());
    if (process.env.DOCN_WRITE_PDF_ARTIFACTS === "1") {
      const directory = fileURLToPath(
        new URL("../../../../.artifacts/l12/pdf/", import.meta.url),
      );
      await mkdir(directory, { recursive: true });
      await writeFile(`${directory}primitive-frames.pdf`, bytes);
    }
    const loadingTask = getDocument({
      data: bytes.slice(),
      useSystemFonts: false,
    });
    try {
      const document = await loadingTask.promise;
      expect(document.numPages).toBe(3);
      const pageContents = [];
      for (let index = 1; index <= document.numPages; index++) {
        const page = await document.getPage(index);
        expect(page.view[2]).toBeCloseTo(595.275590551, 1);
        expect(page.view[3]).toBeCloseTo(841.889763779, 1);
        const content = await page.getTextContent();
        const items = content.items.filter((item) => "str" in item);
        pageContents.push(items);
        const text = items.map((item) => item.str).join(" ");
        if (index === 1) {
          expect(text).toContain("Fixed page content.");
          expect(text).not.toContain("Flow component specimen");
        } else {
          expect(text).toContain("Flow component specimen");
          expect(text).toContain(`Page ${index} of 3`);
          for (const item of items.filter((item) =>
            item.str.startsWith("Entry "),
          )) {
            const top = 841.889763779 - item.transform[5]! - item.height;
            expect(top).toBeGreaterThanOrEqual(72 - 0.1);
            expect(top + item.height).toBeLessThanOrEqual(775.889763779 + 0.1);
            expect(item.transform[4]).toBeGreaterThanOrEqual(36 - 0.1);
            expect(item.transform[4]! + item.width).toBeLessThanOrEqual(
              559.275590551 + 0.1,
            );
          }
        }
      }
      for (const items of pageContents.slice(0, 2)) {
        const text = items.map((item) => item.str).join(" ");
        expect(text).toContain("Élodie Mbemba");
        const nested = items.find(
          (item) => item.str === "Nested editorial typography.",
        );
        const restored = items.find(
          (item) => item.str === "Back to neutral typography.",
        );
        expect(nested).toBeDefined();
        expect(restored).toBeDefined();
        expect(nested!.fontName).not.toBe(restored!.fontName);
        const title = items.find(
          (item) => item.str === "Shared component sample",
        );
        expect(title?.height).toBeCloseTo(16, 1);
      }
      const flowText = pageContents
        .slice(1)
        .flat()
        .map((item) => item.str)
        .join(" ");
      for (let index = 1; index <= 48; index++) {
        expect(
          flowText.match(
            new RegExp(`Entry ${String(index).padStart(2, "0")} -`, "g"),
          ),
        ).toHaveLength(1);
      }
      expect(
        pageContents
          .at(-1)!
          .map((item) => item.str)
          .join(" "),
      ).toContain("End of flow content.");
    } finally {
      await loadingTask.destroy();
    }
  });
});
