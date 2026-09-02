import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";

function decodeBase64Prefix(encoded: string, byteCount: number): number[] {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const character of encoded) {
    if (character === "=") break;
    const value = alphabet.indexOf(character);
    if (value < 0) return [];
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
      if (bytes.length === byteCount) break;
    }
  }
  return bytes;
}

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
  const signature = decodeBase64Prefix(encoded, 8);
  const isPng =
    match[1] === "png" &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => signature[index] === value,
    );
  const isJpeg =
    match[1] === "jpeg" &&
    signature[0] === 0xff &&
    signature[1] === 0xd8 &&
    signature[2] === 0xff;
  if (!isPng && !isJpeg) throw reject();
}
