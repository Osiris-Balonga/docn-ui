import type { ContinuousDocumentMeasurement } from "./runtime";
import type { ResolvedContinuousFormat } from "../core/formats";
import { continuousFinalizationFailure } from "./continuous-plan";

export interface ContinuousTextItem {
  readonly height: number;
  readonly str: string;
  readonly transform: readonly number[];
}

export interface ContinuousPdfInspection {
  readonly items: readonly ContinuousTextItem[];
  readonly pageCount: number;
  readonly pageHeight: number;
  readonly pageWidth: number;
}

export function inspectContinuousTextContent(
  pageCount: number,
  pageHeight: number,
  items: readonly ContinuousTextItem[],
  finalMarker: string,
): ContinuousDocumentMeasurement {
  if (pageCount !== 1) {
    return { pageCount, usedHeightPt: Number.POSITIVE_INFINITY };
  }
  if (
    !items
      .map(({ str }) => str)
      .join(" ")
      .includes(finalMarker)
  ) {
    throw new Error("The continuous final marker was not rendered.");
  }
  const lowerEdge = Math.min(
    ...items.map((item) => (item.transform[5] ?? 0) - item.height),
  );
  return { pageCount, usedHeightPt: pageHeight - lowerEdge };
}

export function qualifyFinalContinuousPdf(
  inspection: ContinuousPdfInspection,
  format: ResolvedContinuousFormat,
  finalMarker: string,
): void {
  const { items, pageCount, pageHeight, pageWidth } = inspection;
  if (
    pageCount !== 1 ||
    !Number.isFinite(pageWidth) ||
    !Number.isFinite(pageHeight) ||
    Math.abs(pageWidth - format.widthPt) > 0.01 ||
    pageHeight <= 0 ||
    pageHeight > format.maxHeightPt + 0.01
  ) {
    return continuousFinalizationFailure();
  }
  const relevantItems = items.filter(({ str }) => str.trim().length > 0);
  const terminalItem = relevantItems.at(-1);
  if (
    !terminalItem ||
    !relevantItems
      .map(({ str }) => str)
      .join(" ")
      .trimEnd()
      .endsWith(finalMarker)
  ) {
    return continuousFinalizationFailure();
  }
  const terminalLowerEdge =
    (terminalItem.transform[5] ?? Number.NaN) - terminalItem.height;
  const lowestEdge = Math.min(
    ...relevantItems.map(
      (item) => (item.transform[5] ?? Number.NaN) - item.height,
    ),
  );
  if (
    !Number.isFinite(terminalLowerEdge) ||
    !Number.isFinite(lowestEdge) ||
    Math.abs(terminalLowerEdge - lowestEdge) > 0.5
  ) {
    return continuousFinalizationFailure();
  }
}
