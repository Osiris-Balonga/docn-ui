import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { createPrimitiveFramesPlan } from "../examples/primitive-frames";
import { createPrimitiveContentPlan } from "../examples/primitive-content";
import { createPrimitivePaginationPlan } from "../examples/primitive-pagination";
import { renderDocumentInNode } from "../render/node";

describe("shared PDF primitive frames", () => {
  it("keeps table rows, repeated regions, summaries and explicit breaks in their flow bounds", async () => {
    const bytes = await renderDocumentInNode(createPrimitivePaginationPlan());
    if (process.env.DOCN_WRITE_PDF_ARTIFACTS === "1") {
      const directory = fileURLToPath(
        new URL("../../../../.artifacts/l12/pdf/", import.meta.url),
      );
      await mkdir(directory, { recursive: true });
      await writeFile(`${directory}primitive-pagination.pdf`, bytes);
    }
    const task = getDocument({ data: bytes.slice(), useSystemFonts: false });
    try {
      const document = await task.promise;
      expect(document.numPages).toBe(4);
      const pages: string[] = [];
      for (let index = 1; index <= document.numPages; index++) {
        const page = await document.getPage(index);
        const content = await page.getTextContent();
        const items = content.items.filter((item) => "str" in item);
        const text = items.map((item) => item.str).join(" ");
        pages.push(text);
        expect(text).toContain("Production ledger");
        expect(text).toContain("DESCRIPTION");
        expect(text).toContain(`Ledger ${index} / 4`);
        expect(text).toContain("hello@example.com");
        for (const item of items.filter((item) => item.str.trim())) {
          expect(item.transform[4]).toBeGreaterThanOrEqual(35.9);
          expect(item.transform[4]! + item.width).toBeLessThanOrEqual(559.38);
          const top = page.view[3]! - item.transform[5]! - item.height;
          const isHeader = [
            "Production ledger",
            "DOCN-UI / REUSABLE PAGINATION",
            "DESCRIPTION",
            "QTY",
            "AMOUNT",
          ].includes(item.str);
          const isFooter =
            item.str === "hello@example.com" || item.str.startsWith("Ledger ");
          if (isHeader) {
            expect(top).toBeGreaterThanOrEqual(35.9);
            expect(top + item.height).toBeLessThanOrEqual(100.1);
          } else if (isFooter) {
            expect(top).toBeGreaterThanOrEqual(785.7);
            expect(top + item.height).toBeLessThanOrEqual(806);
          } else {
            expect(top).toBeGreaterThanOrEqual(111.9);
            expect(top + item.height).toBeLessThanOrEqual(774);
          }
        }
      }
      const text = pages.join(" ");
      for (let index = 1; index <= 40; index++)
        expect(
          text.match(
            new RegExp(`Entry ${String(index).padStart(3, "0")}`, "g"),
          ),
        ).toHaveLength(1);
      expect(pages[0]).toContain("same physical page.");
      expect(pages[1]).toContain("Entry 040");
      expect(pages[1]).not.toContain("Final summary");
      expect(pages[2]).toContain("Final summary");
      expect(pages[2]).toContain("1,000.00");
      expect(pages[2]).toContain("SUMMARY-END");
      expect(pages[2]).not.toContain("Verification appendix");
      expect(pages[3]).toContain("Verification appendix");
      expect(pages[3]).toContain("Manual verification entry");
      expect(pages[3]).toContain("No outstanding entries.");
      expect(pages[3]).toContain("APPENDIX-END");
    } finally {
      await task.destroy();
    }
  });

  it("composes content, static forms, signatures and controlled repeated watermarks", async () => {
    const canvas = createCanvas(280, 140);
    const context = canvas.getContext("2d");
    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0, 280, 140);
    context.fillStyle = "#222222";
    context.fillRect(16, 16, 108, 108);
    context.fillStyle = "#777777";
    context.fillRect(140, 16, 124, 44);
    context.fillRect(140, 76, 124, 48);
    const bytes = await renderDocumentInNode(
      createPrimitiveContentPlan(canvas.toDataURL("image/png")),
    );
    if (process.env.DOCN_WRITE_PDF_ARTIFACTS === "1") {
      const directory = fileURLToPath(
        new URL("../../../../.artifacts/l12/pdf/", import.meta.url),
      );
      await mkdir(directory, { recursive: true });
      await writeFile(`${directory}primitive-content.pdf`, bytes);
    }
    const task = getDocument({ data: bytes.slice(), useSystemFonts: false });
    try {
      const document = await task.promise;
      expect(document.numPages).toBe(2);
      expect(await document.getFieldObjects()).toBeNull();
      const page = await document.getPage(1);
      const content = await page.getTextContent();
      const items = content.items.filter((item) => "str" in item);
      const text = items.map((item) => item.str).join(" ");
      expect(text).toContain("DRAFT");
      expect(text).toContain("SAMPLE");
      for (const expected of [
        "Core document components",
        "explicit emphasis",
        "Élodie Mbemba",
        "Reserve the safe area",
        "Content checked",
        "Print review pending",
        "Local image with a readable caption.",
        "End note:",
      ])
        expect(text).toContain(expected);
      expect(
        items.find((item) => item.str === "Core document components")?.height,
      ).toBeCloseTo(22, 1);
      expect(
        items.find((item) => item.str === "explicit emphasis")?.fontName,
      ).not.toBe(
        items.find((item) => item.str.includes("Selectable text"))?.fontName,
      );
      for (const item of items.filter((item) => item.str.trim())) {
        expect(item.transform[4]).toBeGreaterThanOrEqual(35.9);
        expect(item.transform[4]! + item.width).toBeLessThanOrEqual(559.38);
        const top = page.view[3]! - item.transform[5]! - item.height;
        expect(top).toBeGreaterThanOrEqual(35.9);
        expect(top + item.height).toBeLessThanOrEqual(805.99);
      }
      const annotations = await page.getAnnotations();
      const links = annotations.filter(
        (annotation) => annotation.subtype === "Link",
      );
      expect(links.map((link) => link.url ?? link.unsafeUrl)).toEqual(
        expect.arrayContaining([
          "https://example.com/guide",
          "mailto:hello@example.com",
          "tel:+242065550124",
        ]),
      );
      expect(links.some((link) => link.dest === "end-note")).toBe(true);
      expect(await document.getDestination("end-note")).not.toBeNull();
      for (const link of links) {
        expect(link.rect[2] - link.rect[0]).toBeGreaterThan(0);
        expect(link.rect[3] - link.rect[1]).toBeGreaterThan(0);
      }
      const operators = await page.getOperatorList();
      expect(operators.fnArray).toContain(OPS.paintImageXObject);
      const formPage = await document.getPage(2);
      const formContent = await formPage.getTextContent();
      const formItems = formContent.items.filter((item) => "str" in item);
      const formText = formItems.map((item) => item.str).join(" ");
      for (const label of [
        "Review and sign-off",
        "Draft",
        "Review pending",
        "Note",
        "Complete before printing",
        "Document reference",
        "Purpose",
        "Contact information",
        "Full name (required)",
        "elodie@example.com",
        "14 avenue des Arts",
        "Brazzaville",
        "Telephone",
        "Review details",
        "DOC-026",
        "25",
        "Review date",
        "Review notes",
        "Prepared by",
        "Élodie Mbemba",
        "Editor",
        "15 January 2026",
        "Approved by",
        "Morgan Lee",
        "Reviewer",
        "Witness signature",
        "Collected by",
        "Important",
        "Static print elements only",
        "DRAFT",
      ])
        expect(formText).toContain(label);
      expect(formText).not.toContain("SAMPLE");
      expect(await formPage.getAnnotations()).toHaveLength(0);
      for (const item of formItems.filter((item) => item.str.trim())) {
        expect(item.transform[4]).toBeGreaterThanOrEqual(35.9);
        expect(item.transform[4]! + item.width).toBeLessThanOrEqual(559.38);
        const top = formPage.view[3]! - item.transform[5]! - item.height;
        expect(top).toBeGreaterThanOrEqual(35.9);
        expect(top + item.height).toBeLessThanOrEqual(805.99);
      }
      const field = (label: string) =>
        formItems.find((item) => item.str === label)!;
      expect(field("Full name (required)").transform[5]).toBeCloseTo(
        field("Email").transform[5]!,
        1,
      );
      expect(field("Email").transform[4]).toBeGreaterThan(290);
      expect(field("Reference").transform[5]).toBeCloseTo(
        field("Copies").transform[5]!,
        1,
      );
      expect(field("Copies").transform[5]).toBeCloseTo(
        field("Review date").transform[5]!,
        1,
      );
      expect(field("Review date").transform[4]).toBeGreaterThan(390);
      expect(field("Prepared by").transform[5]).toBeCloseTo(
        field("Approved by").transform[5]!,
        1,
      );
    } finally {
      await task.destroy();
    }
  });

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
