import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { PrintProfile, ResolvedFixedFormat } from "../core/formats";
import type { AssetResolver } from "./assets";
import { registerDocumentFonts } from "./fonts";
import { applyPrintBoxes, getPageGeometry } from "./print-profile";

export type PdfDocumentElement = ReactElement<DocumentProps>;

export interface DocumentRenderRuntime {
  assetResolver: AssetResolver;
  renderDocument(document: PdfDocumentElement): Promise<Uint8Array>;
}

export interface FixedDocumentRenderPlan {
  document: PdfDocumentElement;
  format: ResolvedFixedFormat;
  printProfile: PrintProfile;
}

export async function renderRawDocument(
  document: PdfDocumentElement,
  runtime: DocumentRenderRuntime,
): Promise<Uint8Array> {
  registerDocumentFonts(runtime.assetResolver);
  return runtime.renderDocument(document);
}

export async function renderFixedDocument(
  plan: FixedDocumentRenderPlan,
  runtime: DocumentRenderRuntime,
): Promise<Uint8Array> {
  const raw = await renderRawDocument(plan.document, runtime);
  return applyPrintBoxes(
    raw,
    getPageGeometry(
      plan.format.trim.widthPt,
      plan.format.trim.heightPt,
      plan.printProfile,
    ),
  );
}
