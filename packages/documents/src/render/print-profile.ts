import { PDFDocument, type PDFPage } from "pdf-lib";
import { millimetersToPoints } from "../core/units";

export type QualificationPrintProfile =
  { kind: "screen" } | { kind: "print"; bleedMm: 3; cropMarks: boolean };

export interface PageGeometry {
  bleedInset: number;
  mediaHeight: number;
  mediaWidth: number;
  trimHeight: number;
  trimInset: number;
  trimWidth: number;
}

const MARK_MARGIN_MM = 5;

export function getPageGeometry(
  trimWidth: number,
  trimHeight: number,
  profile: QualificationPrintProfile,
): PageGeometry {
  if (profile.kind === "screen") {
    return {
      mediaWidth: trimWidth,
      mediaHeight: trimHeight,
      trimWidth,
      trimHeight,
      trimInset: 0,
      bleedInset: 0,
    };
  }
  const bleed = millimetersToPoints(profile.bleedMm);
  const margin = profile.cropMarks ? millimetersToPoints(MARK_MARGIN_MM) : 0;
  return {
    mediaWidth: trimWidth + 2 * (bleed + margin),
    mediaHeight: trimHeight + 2 * (bleed + margin),
    trimWidth,
    trimHeight,
    trimInset: bleed + margin,
    bleedInset: margin,
  };
}

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
  for (const page of document.getPages()) setBoxes(page, geometry);
  const result = await document.save({
    addDefaultPage: false,
    useObjectStreams: false,
    updateFieldAppearances: false,
  });
  if (result.byteLength > 20 * 1024 * 1024)
    throw new RangeError("LIMIT_EXCEEDED: final PDF exceeds 20 MiB.");
  return result;
}
