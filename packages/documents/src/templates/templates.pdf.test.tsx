import { fileURLToPath } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { beforeAll, describe, expect, it } from "vitest";
import { resolveFormat } from "../core/formats";
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
    const assets = {
      badgeCreativePortraitSource: imageSource,
      badgeDeveloperPortraitSource: imageSource,
      badgePatternSource: imageSource,
      invoiceLandscapeSource: imageSource,
      portraitSource: imageSource,
      productCardDeckSource: imageSource,
      productNotebookSource: imageSource,
      studioLogoSource: imageSource,
      supportPortraitSource: imageSource,
    };
    const expectedText = new Map([
      ["resume-classic", ["Your name", "EXPERIENCE", "LANGUAGES"]],
      [
        "resume-accountant",
        [
          "SEBASTIAN BENNETT",
          "Detail-oriented accountant",
          "Financial Reporting",
        ],
      ],
      [
        "resume-designer",
        ["Markus", "Professional Summary", "Technical Skills"],
      ],
      [
        "invoice-spacious",
        ["NORTHLINE", "$48.99 due", "Pay with ACH or wire transfer"],
      ],
      [
        "invoice-vertical",
        ["Margarita Perez", "Copywriting for 1 Blog", "QUESTIONS?"],
      ],
      [
        "invoice-corporate",
        ["MERIDIAN WORKS", "Stationary Designs", "GRAND TOTAL"],
      ],
      ["invoice-photo-header", ["INVOICE", "Solt Wagner", "$575.00"]],
      [
        "receipt-order-confirmation",
        ["Your Order Confirmed!", "Workshop notebook", "$203.25"],
      ],
      [
        "receipt-product-barcode",
        ["LUMA SUPPLY", "Protective reader case", "$1,098.00"],
      ],
      [
        "receipt-cash-register",
        ["CASH RECEIPT", "Stone-ground flour", "THANK YOU"],
      ],
      [
        "report-product-analytics",
        ["Northstar Analytics Report", "600.8K", "Users by Source / Medium"],
      ],
      [
        "report-marketplace-revenue",
        ["MARGIN", "Open marketplace", "$96 billion"],
      ],
      [
        "report-customer-support",
        ["Customer support", "76.2%", "What customers are saying"],
      ],
      ["badge-profile-lanyard", ["Daniel Thompson", "LUMINA", "ID 4925"]],
      ["badge-qr-portrait-light", ["Celine", "Rose", "NOVA HEALTH"]],
      ["badge-qr-portrait-blue", ["Celine", "Rose", "NOVA HEALTH"]],
      ["business-card-coral-qr", ["REDWOOD", "RAZIB", "P. FERGUSON"]],
      ["business-card-violet-founder", ["novaarc", "ROHIT VERMA"]],
    ]);

    expect(expectedText.size).toBe(templateDefinitions.length);

    for (const definition of templateDefinitions) {
      const bytes = new Uint8Array(
        await renderTemplateDefinition(definition, assets),
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
          const formatId = definition.supportedFormatIds[0];
          if (!formatId) throw new Error(`${definition.id} has no format.`);
          const expectedFormat = resolveFormat(formatId);
          if (expectedFormat.kind === "fixed") {
            expect(page.view[2]).toBeCloseTo(expectedFormat.trim.widthPt, 1);
            expect(page.view[3]).toBeCloseTo(expectedFormat.trim.heightPt, 1);
          } else {
            expect(page.view[2]).toBeCloseTo(expectedFormat.widthPt, 1);
            expect(page.view[3]).toBeGreaterThan(0);
            expect(page.view[3]).toBeLessThanOrEqual(
              expectedFormat.maxHeightPt,
            );
          }
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
