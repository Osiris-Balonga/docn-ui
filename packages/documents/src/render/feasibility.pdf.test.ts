import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import {
  getDocument,
  type PDFDocumentLoadingTask,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { afterEach, describe, expect, it } from "vitest";
import { resolveFormat } from "../core/formats";
import {
  assertWithinSafeFrame,
  createSafeFrame,
} from "../primitives/measurement";
import { renderQualificationInNode } from "./node";

const POINT_TOLERANCE = 0.1;
const expected = {
  trimWidth: 240.944_881_889_8,
  trimHeight: 155.905_511_811,
  bleed: 8.503_937_007_87,
  markMargin: 14.173_228_346_5,
};

const openDocuments: PDFDocumentLoadingTask[] = [];

async function inspectWithPdfJs(bytes: Uint8Array) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  const document = await loadingTask.promise;
  openDocuments.push(loadingTask);
  const pages = await Promise.all(
    Array.from({ length: document.numPages }, async (_, index) => {
      const page = await document.getPage(index + 1);
      const content = await page.getTextContent();
      const textItems = content.items.filter(
        (
          item,
        ): item is typeof item & {
          height: number;
          str: string;
          transform: number[];
          width: number;
        } =>
          "str" in item &&
          "height" in item &&
          "transform" in item &&
          "width" in item,
      );
      const text = textItems.map((item) => item.str).join(" ");
      const pageHeight = (page.view[3] ?? 0) - (page.view[1] ?? 0);
      const bounds = textItems.map((item) => ({
        x: item.transform[4] ?? 0,
        y: pageHeight - (item.transform[5] ?? 0) - item.height,
        width: item.width,
        height: item.height,
      }));
      return { bounds, view: page.view, text };
    }),
  );
  return { pageCount: document.numPages, pages };
}

async function inspectBoxes(bytes: Uint8Array) {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => ({
    media: page.getMediaBox(),
    crop: page.getCropBox(),
    trim: page.getTrimBox(),
    bleed: page.getBleedBox(),
  }));
}

function expectBox(
  actual: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number; width: number; height: number },
) {
  expect(actual.x).toBeCloseTo(target.x, 1);
  expect(actual.y).toBeCloseTo(target.y, 1);
  expect(actual.width).toBeCloseTo(target.width, 1);
  expect(actual.height).toBeCloseTo(target.height, 1);
  expect(Math.abs(actual.width - target.width)).toBeLessThanOrEqual(
    POINT_TOLERANCE,
  );
  expect(Math.abs(actual.height - target.height)).toBeLessThanOrEqual(
    POINT_TOLERANCE,
  );
}

async function retainArtifact(name: string, bytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../.artifacts/l02/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}${name}.pdf`, bytes);
}

afterEach(async () => {
  await Promise.all(
    openDocuments.splice(0).map((loadingTask) => loadingTask.destroy()),
  );
});

describe("PDF rendering feasibility", () => {
  it("renders an exact two-sided card with local accented text", async () => {
    const bytes = await renderQualificationInNode({
      fixture: "card",
      printProfile: { kind: "screen" },
    });
    const editorialBytes = await renderQualificationInNode({
      fixture: "card",
      printProfile: { kind: "screen" },
      themeId: "editorial",
    });
    const inspection = await inspectWithPdfJs(bytes);
    const editorialInspection = await inspectWithPdfJs(editorialBytes);
    const boxes = await inspectBoxes(bytes);

    expect(inspection.pageCount).toBe(2);
    expect(inspection.pages[0]?.view).toEqual(expect.arrayContaining([0, 0]));
    expect(inspection.pages[0]?.view[2]).toBeCloseTo(expected.trimWidth, 1);
    expect(inspection.pages[0]?.view[3]).toBeCloseTo(expected.trimHeight, 1);
    expect(inspection.pages[0]?.text).toContain("Élodie Mbemba");
    expect(inspection.pages[0]?.text).toContain(
      "Direction créative · Brazzaville",
    );
    expect(inspection.pages[1]?.text).toContain("Back side · 2 / 2");
    expect(editorialInspection.pageCount).toBe(2);
    expect(editorialInspection.pages[0]?.text).toContain("Élodie Mbemba");
    expect(editorialInspection.pages[1]?.text).toContain(
      "Documents précis, sources ouvertes.",
    );
    for (const page of boxes) {
      const trim = {
        x: 0,
        y: 0,
        width: expected.trimWidth,
        height: expected.trimHeight,
      };
      expectBox(page.media, trim);
      expectBox(page.crop, trim);
      expectBox(page.trim, trim);
      expectBox(page.bleed, trim);
    }
    await retainArtifact("card-screen", bytes);
    await retainArtifact("card-editorial", editorialBytes);
  });

  it("publishes exact trim and bleed boxes with and without crop-mark margins", async () => {
    const noMarksBytes = await renderQualificationInNode({
      fixture: "card",
      printProfile: { kind: "print", bleedMm: 3, cropMarks: false },
    });
    const marksBytes = await renderQualificationInNode({
      fixture: "card",
      printProfile: { kind: "print", bleedMm: 3, cropMarks: true },
    });
    const [noMarks, marks] = await Promise.all([
      inspectBoxes(noMarksBytes),
      inspectBoxes(marksBytes),
    ]);

    const printWidth = expected.trimWidth + 2 * expected.bleed;
    const printHeight = expected.trimHeight + 2 * expected.bleed;
    for (const page of noMarks) {
      expectBox(page.media, {
        x: 0,
        y: 0,
        width: printWidth,
        height: printHeight,
      });
      expectBox(page.trim, {
        x: expected.bleed,
        y: expected.bleed,
        width: expected.trimWidth,
        height: expected.trimHeight,
      });
      expectBox(page.bleed, {
        x: 0,
        y: 0,
        width: printWidth,
        height: printHeight,
      });
    }
    for (const page of marks) {
      const trimInset = expected.bleed + expected.markMargin;
      expectBox(page.media, {
        x: 0,
        y: 0,
        width: printWidth + 2 * expected.markMargin,
        height: printHeight + 2 * expected.markMargin,
      });
      expectBox(page.trim, {
        x: trimInset,
        y: trimInset,
        width: expected.trimWidth,
        height: expected.trimHeight,
      });
      expectBox(page.bleed, {
        x: expected.markMargin,
        y: expected.markMargin,
        width: printWidth,
        height: printHeight,
      });
    }
    await retainArtifact("card-print", noMarksBytes);
    await retainArtifact("card-crop-marks", marksBytes);
  });

  it("paginates a small table without losing its final row", async () => {
    const bytes = await renderQualificationInNode({ fixture: "table" });
    const inspection = await inspectWithPdfJs(bytes);
    const allText = inspection.pages.map((page) => page.text).join(" ");

    expect(inspection.pageCount).toBeGreaterThan(1);
    expect(allText).toContain("Deterministic pagination row 1");
    expect(allText).toContain("Deterministic pagination row 56");
    expect(inspection.pages.at(-1)?.text).toContain("Final marker row 56");
    await retainArtifact("multipage-table", bytes);
  });

  it("composes shared primitives inside the measured card safe area", async () => {
    const bytes = await renderQualificationInNode({
      fixture: "primitives",
      themeId: "editorial",
    });
    const inspection = await inspectWithPdfJs(bytes);
    const format = resolveFormat("card-85x55");
    if (format.kind !== "fixed")
      throw new Error("Expected a fixed card format.");
    const frame = createSafeFrame(format);

    expect(inspection.pageCount).toBe(1);
    expect(inspection.pages[0]?.text).toContain("Élodie Mbemba");
    expect(inspection.pages[0]?.text).toContain("Direction créative");
    expect(inspection.pages[0]?.text).toContain("bonjour@docn-ui.dev");
    for (const bounds of inspection.pages[0]?.bounds ?? []) {
      assertWithinSafeFrame(bounds, frame, ["pages", 0, "text"]);
    }
    await retainArtifact("primitives-card", bytes);
  });

  it("measures short and long 58/80 mm receipts from rendered content", async () => {
    const cases = [
      {
        artifact: "receipt-58-short",
        widthMm: 58 as const,
        lineCount: 4,
        finalText: "final 58 short",
      },
      {
        artifact: "receipt-58-long",
        widthMm: 58 as const,
        lineCount: 34,
        finalText: "final 58 long",
      },
      {
        artifact: "receipt-80-short",
        widthMm: 80 as const,
        lineCount: 4,
        finalText: "final 80 short",
      },
      {
        artifact: "receipt-80-long",
        widthMm: 80 as const,
        lineCount: 34,
        finalText: "final 80 long",
      },
    ];
    const measurements = new Map<string, number>();

    for (const fixture of cases) {
      const bytes = await renderQualificationInNode({
        fixture: "receipt",
        receipt: fixture,
      });
      const inspection = await inspectWithPdfJs(bytes);
      const width = inspection.pages[0]?.view[2] ?? 0;
      const height = inspection.pages[0]?.view[3] ?? 0;
      measurements.set(fixture.artifact, height);

      expect(inspection.pageCount).toBe(1);
      expect(width).toBeCloseTo(
        fixture.widthMm === 58 ? 164.409_448_818_9 : 226.771_653_543_3,
        1,
      );
      expect(height).toBeGreaterThan(0);
      expect(height).toBeLessThan(1_417.322_834_645_7);
      expect(inspection.pages[0]?.text).toContain(fixture.finalText);
      await retainArtifact(fixture.artifact, bytes);
    }

    expect(measurements.get("receipt-58-long")).toBeGreaterThan(
      measurements.get("receipt-58-short") ?? Infinity,
    );
    expect(measurements.get("receipt-80-long")).toBeGreaterThan(
      measurements.get("receipt-80-short") ?? Infinity,
    );
    expect(measurements.get("receipt-58-long")).toBeGreaterThan(
      measurements.get("receipt-80-long") ?? Infinity,
    );
  });

  it("rejects receipt content that exceeds the configured physical limit", async () => {
    await expect(
      renderQualificationInNode({
        fixture: "receipt",
        receipt: {
          widthMm: 58,
          lineCount: 30,
          finalText: "LIMIT MARKER",
          maxHeightMm: 45,
        },
      }),
    ).rejects.toMatchObject({ code: "RECEIPT_HEIGHT_LIMIT" });
  });
});
