import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  renderFeasibilityFixture,
  type FeasibilityRenderOptions,
} from "./feasibility-fixtures";
import { createNodeDocumentRuntime } from "./node";

async function measureContent(bytes: Uint8Array, finalText: string) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    if (document.numPages !== 1)
      return {
        pageCount: document.numPages,
        usedHeight: Number.POSITIVE_INFINITY,
      };
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const textItems = content.items.filter(
      (
        item,
      ): item is typeof item & {
        height: number;
        str: string;
        transform: number[];
      } => "str" in item && "height" in item,
    );
    const extractedText = textItems.map((item) => item.str).join(" ");
    if (!extractedText.includes(finalText)) {
      throw new Error("The receipt final marker was not rendered.");
    }
    const lowerEdge = Math.min(
      ...textItems.map((item) => (item.transform[5] ?? 0) - item.height * 0.25),
    );
    const pageHeight = (page.view[3] ?? 0) - (page.view[1] ?? 0);
    return {
      pageCount: document.numPages,
      usedHeight: pageHeight - lowerEdge + 12,
    };
  } finally {
    await loadingTask.destroy();
  }
}

export function renderFeasibilityFixtureInNode(
  options: FeasibilityRenderOptions,
): Promise<Uint8Array> {
  return renderFeasibilityFixture(
    options,
    createNodeDocumentRuntime(),
    measureContent,
  );
}
