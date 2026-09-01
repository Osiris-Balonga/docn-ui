import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { createNodeAssetResolver } from "../render/assets.node";
import { registerDocumentFonts } from "../render/fonts";
import type { TemplateDefinition } from "./types";

export function prepareTemplateFonts(assetRoot: string) {
  registerDocumentFonts(createNodeAssetResolver(assetRoot));
}

export function renderTemplateDefinition(
  definition: TemplateDefinition,
  imageSource: string,
) {
  return renderToBuffer(definition.renderSample({ imageSource }));
}

export async function normalizeGeneratedPdf(input: Uint8Array) {
  const document = await PDFDocument.load(input, { updateMetadata: false });
  const generatedAt = new Date("2000-01-01T00:00:00.000Z");
  document.setCreationDate(generatedAt);
  document.setModificationDate(generatedAt);
  delete document.context.trailerInfo.ID;
  return document.save({ objectsPerTick: Number.POSITIVE_INFINITY });
}
