import type { PrintProfile } from "./formats";
import { millimetersToPoints } from "./units";

export interface PageGeometry {
  bleedInset: number;
  mediaHeight: number;
  mediaWidth: number;
  trimHeight: number;
  trimInset: number;
  trimWidth: number;
}

const MARK_MARGIN_MM = 5;

export function getPageGeometry(
  trimWidth: number,
  trimHeight: number,
  profile: PrintProfile,
): PageGeometry {
  if (profile.kind === "screen") {
    return {
      mediaWidth: trimWidth,
      mediaHeight: trimHeight,
      trimWidth,
      trimHeight,
      trimInset: 0,
      bleedInset: 0,
    };
  }
  const bleed = millimetersToPoints(profile.bleedMm);
  const margin = profile.cropMarks ? millimetersToPoints(MARK_MARGIN_MM) : 0;
  return {
    mediaWidth: trimWidth + 2 * (bleed + margin),
    mediaHeight: trimHeight + 2 * (bleed + margin),
    trimWidth,
    trimHeight,
    trimInset: bleed + margin,
    bleedInset: margin,
  };
}
