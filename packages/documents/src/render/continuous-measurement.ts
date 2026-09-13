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

interface GlyphBounds {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
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
  const bounds = relevantItems.map(glyphBounds);
  if (bounds.some((value) => value === null)) {
    throw new Error("The continuous text geometry was invalid.");
  }
  const lowerEdge = Math.min(
    ...bounds.map((value) => value?.bottom ?? Number.NaN),
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
    const bounds = glyphBounds(item);
    if (
      !bounds ||
      bounds.left < pageXMin - 0.01 ||
      bounds.right > pageXMax + 0.01 ||
      bounds.bottom < pageYMin - 0.01 ||
      bounds.top > pageYMax + 0.01
    ) {
      return continuousFinalizationFailure();
    }
  }
  const terminalLowerEdge = glyphBounds(terminalItem)?.bottom ?? Number.NaN;
  const relevantBounds = relevantItems.map(glyphBounds);
  const lowestEdge = Math.min(
    ...relevantBounds.map((bounds) => bounds?.bottom ?? Number.NaN),
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
  let lineStart = items[0];
  if (!lineStart) return false;
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    if (!previous || !current) return false;
    if (areTextItemsOnSameLine(previous, current)) {
      if (!areAdjacentTextItems(previous, current)) return false;
      continue;
    }
    if (!isPlausibleLineWrap(previous, current, lineStart)) {
      return false;
    }
    lineStart = current;
  }
  return true;
}

function hasFiniteGlyphBox(item: ContinuousTextItem): boolean {
  return glyphBounds(item) !== null;
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

function isPlausibleLineWrap(
  previous: ContinuousTextItem,
  current: ContinuousTextItem,
  previousLineStart: ContinuousTextItem,
): boolean {
  if (
    !hasFiniteGlyphBox(previous) ||
    !hasFiniteGlyphBox(current) ||
    !hasFiniteGlyphBox(previousLineStart)
  ) {
    return false;
  }
  const previousX = previous.transform[4] ?? Number.NaN;
  const currentX = current.transform[4] ?? Number.NaN;
  const lineStartX = previousLineStart.transform[4] ?? Number.NaN;
  const previousBaseline = previous.transform[5] ?? Number.NaN;
  const currentBaseline = current.transform[5] ?? Number.NaN;
  const largerHeight = Math.max(previous.height, current.height);
  const lineTolerance = Math.max(
    0.5,
    Math.min(previous.height, current.height) * 0.25,
  );
  const verticalDrop = previousBaseline - currentBaseline;
  const horizontalReturnTolerance = Math.max(2, largerHeight * 2);
  return (
    verticalDrop > lineTolerance &&
    verticalDrop <= Math.max(4, largerHeight * 3) &&
    currentX <= previousX + largerHeight &&
    Math.abs(currentX - lineStartX) <= horizontalReturnTolerance
  );
}

function glyphBounds(item: ContinuousTextItem): GlyphBounds | null {
  if (
    item.transform.length < 6 ||
    !Number.isFinite(item.width) ||
    !Number.isFinite(item.height) ||
    item.width <= 0 ||
    item.height <= 0
  ) {
    return null;
  }
  const [a, b, c, d, x, y] = item.transform;
  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c) ||
    !Number.isFinite(d) ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return null;
  }
  const horizontalScale = Math.hypot(a ?? 0, b ?? 0);
  const verticalScale = Math.hypot(c ?? 0, d ?? 0);
  const determinant = (a ?? 0) * (d ?? 0) - (b ?? 0) * (c ?? 0);
  if (
    horizontalScale <= Number.EPSILON ||
    verticalScale <= Number.EPSILON ||
    Math.abs(determinant) <= horizontalScale * verticalScale * 1e-6
  ) {
    return null;
  }
  const horizontalX = ((a ?? 0) / horizontalScale) * item.width;
  const horizontalY = ((b ?? 0) / horizontalScale) * item.width;
  const verticalX = ((c ?? 0) / verticalScale) * item.height;
  const verticalY = ((d ?? 0) / verticalScale) * item.height;
  const points = [
    [x ?? 0, y ?? 0],
    [(x ?? 0) + horizontalX, (y ?? 0) + horizontalY],
    [(x ?? 0) - verticalX, (y ?? 0) - verticalY],
    [(x ?? 0) + horizontalX - verticalX, (y ?? 0) + horizontalY - verticalY],
  ] as const;
  return {
    bottom: Math.min(...points.map((point) => point[1])),
    left: Math.min(...points.map((point) => point[0])),
    right: Math.max(...points.map((point) => point[0])),
    top: Math.max(...points.map((point) => point[1])),
  };
}
