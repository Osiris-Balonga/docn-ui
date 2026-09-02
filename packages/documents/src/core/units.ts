export const POINTS_PER_INCH = 72;
export const MILLIMETERS_PER_INCH = 25.4;

export interface PhysicalDimensions {
  heightMm: number;
  heightPt: number;
  widthMm: number;
  widthPt: number;
}

export function millimetersToPoints(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      "A physical dimension must be a positive finite number.",
    );
  }
  return (value * POINTS_PER_INCH) / MILLIMETERS_PER_INCH;
}

export function pointsToMillimeters(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      "A physical dimension must be a positive finite number.",
    );
  }
  return (value * MILLIMETERS_PER_INCH) / POINTS_PER_INCH;
}

export function toPhysicalDimensions(
  widthMm: number,
  heightMm: number,
): PhysicalDimensions {
  return {
    widthMm,
    heightMm,
    widthPt: millimetersToPoints(widthMm),
    heightPt: millimetersToPoints(heightMm),
  };
}

export const cardTrim = {
  width: millimetersToPoints(85),
  height: millimetersToPoints(55),
} as const;
