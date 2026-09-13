import { PDFDocument } from "pdf-lib";
import type { RenderResult } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import { pointsToMillimeters } from "../core/units";

export async function createRenderResult(
  pdfBytes: Uint8Array,
  fingerprint: string,
  revision: number,
): Promise<RenderResult> {
  try {
    const document = await PDFDocument.load(pdfBytes, {
      updateMetadata: false,
    });
    const finalDimensions = document.getPages().map((page) => {
      const media = page.getMediaBox();
      return {
        heightMm: pointsToMillimeters(media.height),
        heightPt: media.height,
        widthMm: pointsToMillimeters(media.width),
        widthPt: media.width,
      };
    });
    if (finalDimensions.length === 0) {
      throw new Error("The renderer produced a PDF without pages.");
    }
    return {
      diagnostics: [],
      finalDimensions,
      fingerprint,
      pageCount: finalDimensions.length,
      pdfBytes,
      revision,
    };
  } catch (error) {
    if (error instanceof DocumentValidationError) throw error;
    throw new DocumentValidationError([
      {
        code: "RENDER_FAILED",
        message: "The final PDF could not be inspected.",
        path: ["document"],
      },
    ]);
  }
}
