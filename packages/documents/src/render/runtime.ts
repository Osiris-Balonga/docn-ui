import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type {
  PrintProfile,
  ResolvedContinuousFormat,
  ResolvedFixedFormat,
} from "../core/formats";
import type { AssetResolver } from "./assets";
import { DocumentValidationError } from "../core/errors";
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

export interface ContinuousDocumentRenderPlan {
  createDocument(heightPt: number): PdfDocumentElement;
  finalMarker: string;
  format: ResolvedContinuousFormat;
}

export interface ContinuousDocumentMeasurement {
  pageCount: number;
  usedHeightPt: number;
}

export type ContinuousDocumentMeasurer = (
  bytes: Uint8Array,
  finalMarker: string,
) => Promise<ContinuousDocumentMeasurement>;

const CONTINUOUS_HEIGHT_SAFETY_POINTS = 12;

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

export async function renderContinuousDocument(
  plan: ContinuousDocumentRenderPlan,
  runtime: DocumentRenderRuntime,
  measureDocument: ContinuousDocumentMeasurer,
): Promise<Uint8Array> {
  registerDocumentFonts(runtime.assetResolver);
  const probe = await runtime.renderDocument(
    plan.createDocument(plan.format.maxHeightPt),
  );
  let measurement: ContinuousDocumentMeasurement;
  try {
    measurement = await measureDocument(probe, plan.finalMarker);
  } catch (error) {
    if (error instanceof DocumentValidationError) throw error;
    throw new DocumentValidationError([
      {
        code: "RENDER_FAILED",
        message:
          "The receipt height could not be measured. Review the content and render again.",
        path: ["data"],
      },
    ]);
  }
  const heightPt = measurement.usedHeightPt + CONTINUOUS_HEIGHT_SAFETY_POINTS;
  if (
    measurement.pageCount !== 1 ||
    !Number.isFinite(heightPt) ||
    heightPt > plan.format.maxHeightPt
  ) {
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message: `Receipt content exceeds the ${plan.format.maxHeightMm} mm height limit. Remove lines or shorten content, then render again.`,
        path: ["data", "lines"],
      },
    ]);
  }
  const raw = await runtime.renderDocument(plan.createDocument(heightPt));
  return applyPrintBoxes(
    raw,
    getPageGeometry(plan.format.widthPt, heightPt, { kind: "screen" }),
  );
}
