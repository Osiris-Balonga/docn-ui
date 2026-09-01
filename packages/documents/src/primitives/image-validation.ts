import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";

export function assertLocalImage(
  source: string,
  width: number,
  height: number,
  borderRadius?: number,
): void {
  if (![width, height].every((value) => Number.isFinite(value) && value > 0))
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: "Image dimensions must be finite positive points.",
        path: ["image", "size"],
      },
    ]);
  if (
    borderRadius !== undefined &&
    (!Number.isFinite(borderRadius) ||
      borderRadius < 0 ||
      borderRadius > Math.min(width, height) / 2)
  )
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message:
          "Image border radius must be a finite value no larger than half the shortest side.",
        path: ["image", "borderRadius"],
      },
    ]);
  const reject = () =>
    new DocumentValidationError([
      {
        code: "ASSET_REJECTED",
        message:
          "Use a prevalidated local PNG/JPEG data URL or a caller-owned blob URL.",
        path: ["image", "resolvedSource"],
      },
    ]);
  if (typeof source !== "string") throw reject();
  // Blob bytes, dimensions and lifetime belong to the existing local import boundary.
  if (/^blob:(?:https?:\/\/[^\s]+|null\/[^\s]+|nodedata:[^\s]+)$/.test(source))
    return;
  const match = /^data:image\/(png|jpeg);base64,/.exec(source);
  if (!match) throw reject();
  const encoded = source.slice(match[0].length);
  if (
    !encoded.length ||
    encoded.length > Math.ceil(DOCUMENT_LIMITS.imageBytes / 3) * 4 ||
    encoded.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)
  )
    throw reject();
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  if ((encoded.length * 3) / 4 - padding > DOCUMENT_LIMITS.imageBytes)
    throw reject();
}
