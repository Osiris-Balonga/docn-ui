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
  const relevantItems = items.filter(({ str }) => str.trim().length > 0);
  if (terminalMarkerItems(relevantItems, finalMarker).length === 0) {
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
  const terminalItem = markerItems.at(-1);
  if (!terminalItem) return continuousFinalizationFailure();
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
    if (spaced === expected || joined === expected) {
      if (!isCoherentMarkerSequence(suffix)) return [];
      const precedingItem = items[index - 1];
      const firstMarkerItem = suffix[0];
      if (
        precedingItem &&
        firstMarkerItem &&
        violatesLeadingBoundary(precedingItem, firstMarkerItem)
      ) {
        return [];
      }
      return suffix;
    }
    if (spaced.length > expected.length && joined.length > expected.length) {
      break;
    }
  }
  return [];
}

function isCoherentMarkerSequence(
  items: readonly ContinuousTextItem[],
): boolean {
  if (items.length === 0 || items.some((item) => !hasFiniteGlyphBox(item))) {
    return false;
  }
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    if (!previous || !current || !areAdjacentTextItems(previous, current)) {
      return false;
    }
  }
  return true;
}

function hasFiniteGlyphBox(item: ContinuousTextItem): boolean {
  const x = item.transform[4] ?? Number.NaN;
  const y = item.transform[5] ?? Number.NaN;
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    Number.isFinite(item.width) &&
    Number.isFinite(item.height) &&
    item.width >= 0 &&
    item.height > 0
  );
}

function areAdjacentTextItems(
  leftItem: ContinuousTextItem,
  rightItem: ContinuousTextItem,
): boolean {
  if (!hasFiniteGlyphBox(leftItem) || !hasFiniteGlyphBox(rightItem)) {
    return false;
  }
  const leftX = leftItem.transform[4] ?? Number.NaN;
  const rightX = rightItem.transform[4] ?? Number.NaN;
  const smallerHeight = Math.min(leftItem.height, rightItem.height);
  const largerHeight = Math.max(leftItem.height, rightItem.height);
  const maximumGap = Math.max(1, largerHeight * 1.5);
  const maximumOverlap = Math.max(0.5, smallerHeight * 0.5);
  const gap = rightX - (leftX + leftItem.width);
  return (
    rightX >= leftX &&
    areTextItemsOnSameLine(leftItem, rightItem) &&
    gap >= -maximumOverlap &&
    gap <= maximumGap
  );
}

function violatesLeadingBoundary(
  precedingItem: ContinuousTextItem,
  firstMarkerItem: ContinuousTextItem,
): boolean {
  if (
    !hasFiniteGlyphBox(precedingItem) ||
    !hasFiniteGlyphBox(firstMarkerItem)
  ) {
    return true;
  }
  const precedingX = precedingItem.transform[4] ?? Number.NaN;
  const markerX = firstMarkerItem.transform[4] ?? Number.NaN;
  const maximumGap = Math.max(
    1,
    Math.max(precedingItem.height, firstMarkerItem.height) * 1.5,
  );
  return (
    precedingX <= markerX &&
    areTextItemsOnSameLine(precedingItem, firstMarkerItem) &&
    markerX - (precedingX + precedingItem.width) <= maximumGap
  );
}

function areTextItemsOnSameLine(
  leftItem: ContinuousTextItem,
  rightItem: ContinuousTextItem,
): boolean {
  const leftBaseline = leftItem.transform[5] ?? Number.NaN;
  const rightBaseline = rightItem.transform[5] ?? Number.NaN;
  const baselineTolerance = Math.max(
    0.5,
    Math.min(leftItem.height, rightItem.height) * 0.25,
  );
  return Math.abs(rightBaseline - leftBaseline) <= baselineTolerance;
}
