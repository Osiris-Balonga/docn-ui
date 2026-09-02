import { PDFDocument, type PDFPage } from "pdf-lib";
import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import type { PageGeometry } from "../core/page-geometry";
export { getPageGeometry, type PageGeometry } from "../core/page-geometry";

function setBoxes(page: PDFPage, geometry: PageGeometry) {
  page.setMediaBox(0, 0, geometry.mediaWidth, geometry.mediaHeight);
  page.setCropBox(0, 0, geometry.mediaWidth, geometry.mediaHeight);
  page.setTrimBox(
    geometry.trimInset,
    geometry.trimInset,
    geometry.trimWidth,
    geometry.trimHeight,
  );
  page.setBleedBox(
    geometry.bleedInset,
    geometry.bleedInset,
    geometry.mediaWidth - 2 * geometry.bleedInset,
    geometry.mediaHeight - 2 * geometry.bleedInset,
  );
}

export async function applyPrintBoxes(
  bytes: Uint8Array,
  geometry: PageGeometry,
): Promise<Uint8Array> {
  const document = await PDFDocument.load(bytes, { updateMetadata: false });
  if (document.getPageCount() > DOCUMENT_LIMITS.pages)
    throw new DocumentValidationError([
      {
        code: "LIMIT_EXCEEDED",
        message: `Final PDF exceeds the ${DOCUMENT_LIMITS.pages}-page limit.`,
        path: ["document", "pages"],
      },
    ]);
  for (const page of document.getPages()) setBoxes(page, geometry);
  const result = await document.save({
    addDefaultPage: false,
    useObjectStreams: false,
    updateFieldAppearances: false,
  });
  if (result.byteLength > DOCUMENT_LIMITS.finalPdfBytes)
    throw new DocumentValidationError([
      {
        code: "LIMIT_EXCEEDED",
        message: "Final PDF exceeds the 20 MiB limit.",
        path: ["document", "bytes"],
      },
    ]);
  return result;
}
