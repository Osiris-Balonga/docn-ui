import type { ContinuousDocumentMeasurement } from "./runtime";

export interface ContinuousTextItem {
  readonly height: number;
  readonly str: string;
  readonly transform: readonly number[];
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
