import { DocumentValidationError } from "../core/errors";
import type { ResolvedFixedFormat } from "../core/formats";
import { millimetersToPoints } from "../core/units";

export interface LayoutBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface SafeFrame extends LayoutBounds {
  pageHeight: number;
  pageWidth: number;
}

export const LAYOUT_TOLERANCE_POINTS = 0.1;

export function createSafeFrame(format: ResolvedFixedFormat): SafeFrame {
  const inset = millimetersToPoints(format.safeAreaMm);
  const width = format.trim.widthPt - 2 * inset;
  const height = format.trim.heightPt - 2 * inset;
  if (width <= 0 || height <= 0) {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: "The format safe area leaves no usable content frame.",
        path: ["formatId"],
      },
    ]);
  }
  return {
    x: inset,
    y: inset,
    width,
    height,
    pageWidth: format.trim.widthPt,
    pageHeight: format.trim.heightPt,
  };
}

export function assertWithinSafeFrame(
  bounds: LayoutBounds,
  frame: SafeFrame,
  path: readonly (number | string)[] = ["layout"],
): void {
  const minimumX = frame.x - LAYOUT_TOLERANCE_POINTS;
  const minimumY = frame.y - LAYOUT_TOLERANCE_POINTS;
  const maximumX = frame.x + frame.width + LAYOUT_TOLERANCE_POINTS;
  const maximumY = frame.y + frame.height + LAYOUT_TOLERANCE_POINTS;
  if (
    bounds.x < minimumX ||
    bounds.y < minimumY ||
    bounds.x + bounds.width > maximumX ||
    bounds.y + bounds.height > maximumY
  ) {
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message: "Measured content exceeds the fixed format safe area.",
        path,
      },
    ]);
  }
}
