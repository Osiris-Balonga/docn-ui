import { fileURLToPath } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { beforeAll, describe, expect, it } from "vitest";
import { templateDefinitions } from "./index";
import { prepareTemplateFonts, renderTemplateDefinition } from "./render";

beforeAll(() => {
  prepareTemplateFonts(
    fileURLToPath(new URL("../../assets/", import.meta.url)),
  );
});

describe("reference-led templates", () => {
  it("renders every catalog source with its declared pages and defining content", async () => {
    const canvas = createCanvas(640, 420);
    const context = canvas.getContext("2d");
    context.fillStyle = "#e5e7eb";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111827";
    context.fillRect(48, 48, 300, 210);
    context.fillStyle = "#a3a3a3";
    context.fillRect(380, 72, 190, 124);
    const imageSource = canvas.toDataURL("image/png");
    const expectedText = new Map([
      ["resume-classic", ["Your name", "EXPERIENCE", "LANGUAGES"]],
      [
        "report-photo",
        ["REPORT TITLE", "Introduction", "Insert your heading here"],
      ],
      [
        "invoice-stripe",
        ["Invoice", "$48.99 due", "Pay with ACH or wire transfer"],
      ],
      [
        "invoice-vertical",
        ["Margarita Perez", "Copywriting for 1 Blog", "QUESTIONS?"],
      ],
      ["invoice-corporate", ["GLOBEX", "Stationary Designs", "GRAND TOTAL"]],
      [
        "receipt-order-confirmation",
        ["Your Order Confirmed!", "Workshop access pass", "$203.25"],
      ],
    ]);

    for (const definition of templateDefinitions) {
      const bytes = new Uint8Array(
        await renderTemplateDefinition(definition, imageSource),
      );
      const loadingTask = getDocument({
        data: bytes.slice(),
        useSystemFonts: false,
      });
      try {
        const document = await loadingTask.promise;
        expect(document.numPages).toBe(definition.sides);
        const pages = [];
        for (
          let pageNumber = 1;
          pageNumber <= document.numPages;
          pageNumber++
        ) {
          const page = await document.getPage(pageNumber);
          expect(page.view[2]).toBeCloseTo(595.28, 1);
          expect(page.view[3]).toBeCloseTo(841.89, 1);
          const content = await page.getTextContent();
          pages.push(
            content.items
              .filter((item) => "str" in item)
              .map((item) => item.str)
              .join(" "),
          );
        }
        const text = pages.join(" ");
        for (const snippet of expectedText.get(definition.id) ?? [])
          expect(text).toContain(snippet);
      } finally {
        await loadingTask.destroy();
      }
    }
  });
});
