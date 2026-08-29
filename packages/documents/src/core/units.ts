export const POINTS_PER_INCH = 72;
export const MILLIMETERS_PER_INCH = 25.4;

export function millimetersToPoints(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      "A physical dimension must be a positive finite number.",
    );
  }
  return (value * POINTS_PER_INCH) / MILLIMETERS_PER_INCH;
}

export const cardTrim = {
  width: millimetersToPoints(85),
  height: millimetersToPoints(55),
} as const;
