import type { ContinuousDocumentMeasurement } from "./runtime";
import type { ResolvedContinuousFormat } from "../core/formats";
import { continuousFinalizationFailure } from "./continuous-plan";

export interface ContinuousTextItem {
  readonly height: number;
  readonly str: string;
  readonly transform: readonly number[];
  readonly width: number;
}

export interface ContinuousPdfInspection {
  readonly items: readonly ContinuousTextItem[];
  readonly pageCount: number;
  readonly pageHeight: number;
  readonly pageWidth: number;
  readonly pageXMax: number;
  readonly pageXMin: number;
  readonly pageYMax: number;
  readonly pageYMin: number;
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
  const {
    items,
    pageCount,
    pageHeight,
    pageWidth,
    pageXMax,
    pageXMin,
    pageYMax,
    pageYMin,
  } = inspection;
  if (
    pageCount !== 1 ||
    !Number.isFinite(pageWidth) ||
    !Number.isFinite(pageHeight) ||
    !Number.isFinite(pageXMin) ||
    !Number.isFinite(pageXMax) ||
    !Number.isFinite(pageYMin) ||
    !Number.isFinite(pageYMax) ||
    Math.abs(pageXMax - pageXMin - pageWidth) > 0.01 ||
    Math.abs(pageYMax - pageYMin - pageHeight) > 0.01 ||
    Math.abs(pageWidth - format.widthPt) > 0.01 ||
    pageHeight <= 0 ||
    pageHeight > format.maxHeightPt + 0.01
  ) {
    return continuousFinalizationFailure();
  }
  const relevantItems = items.filter(({ str }) => str.trim().length > 0);
  const markerItems = terminalMarkerItems(relevantItems, finalMarker);
  const markerStartIndex = relevantItems.length - markerItems.length;
  const precedingItem = relevantItems[markerStartIndex - 1];
  const firstMarkerItem = markerItems[0];
  const terminalItem = markerItems.at(-1);
  if (!terminalItem) return continuousFinalizationFailure();
  if (precedingItem && firstMarkerItem) {
    const precedingRight =
      (precedingItem.transform[4] ?? Number.NaN) + precedingItem.width;
    const markerLeft = firstMarkerItem.transform[4] ?? Number.NaN;
    const sameBaseline =
      Math.abs(
        (precedingItem.transform[5] ?? Number.NaN) -
          (firstMarkerItem.transform[5] ?? Number.NaN),
      ) <= 0.5;
    if (
      sameBaseline &&
      Number.isFinite(precedingRight) &&
      Number.isFinite(markerLeft) &&
      markerLeft - precedingRight <= 0.5
    ) {
      return continuousFinalizationFailure();
    }
  }
  for (const item of markerItems) {
    const x = item.transform[4] ?? Number.NaN;
    const y = item.transform[5] ?? Number.NaN;
    const left = Math.min(x, x + item.width);
    const right = Math.max(x, x + item.width);
    const bottom = y - item.height;
    const top = y + item.height;
    if (
      !Number.isFinite(left) ||
      !Number.isFinite(right) ||
      !Number.isFinite(bottom) ||
      !Number.isFinite(top) ||
      item.width < 0 ||
      item.height <= 0 ||
      left < pageXMin - 0.01 ||
      right > pageXMax + 0.01 ||
      bottom < pageYMin - 0.01 ||
      top > pageYMax + 0.01
    ) {
      return continuousFinalizationFailure();
    }
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

function normalizeMarkerText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function terminalMarkerItems(
  items: readonly ContinuousTextItem[],
  finalMarker: string,
): readonly ContinuousTextItem[] {
  const expected = normalizeMarkerText(finalMarker);
  const suffix: ContinuousTextItem[] = [];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (!item) break;
    suffix.unshift(item);
    const spaced = normalizeMarkerText(suffix.map(({ str }) => str).join(" "));
    const joined = normalizeMarkerText(suffix.map(({ str }) => str).join(""));
    if (spaced === expected || joined === expected) return suffix;
    if (spaced.length > expected.length && joined.length > expected.length) {
      break;
    }
  }
  return [];
}
