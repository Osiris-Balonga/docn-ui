import { DOCUMENT_LIMITS } from "@docn-ui/documents/core";
import type { PdfUserAsset } from "@/workers/pdf/protocol";

export const USER_LOGO_ASSET_ID = "user-logo";

export class ImageImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageImportError";
  }
}

export function detectImageMimeType(
  bytes: Uint8Array,
): PdfUserAsset["mimeType"] | undefined {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return "image/png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "image/jpeg";
  return undefined;
}

export function validateImageEnvelope(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > DOCUMENT_LIMITS.imageBytes)
    throw new ImageImportError("Choose an image no larger than 5 MiB.");
  const mimeType = detectImageMimeType(bytes);
  if (!mimeType)
    throw new ImageImportError("Choose a valid PNG or JPEG image.");
  return mimeType;
}

export async function normalizeLocalImage(file: File): Promise<PdfUserAsset> {
  if (file.size === 0 || file.size > DOCUMENT_LIMITS.imageBytes)
    throw new ImageImportError("Choose an image no larger than 5 MiB.");
  const input = await file.arrayBuffer();
  const mimeType = validateImageEnvelope(new Uint8Array(input));

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(new Blob([input], { type: mimeType }), {
      imageOrientation: "from-image",
    });
  } catch {
    throw new ImageImportError("The image could not be decoded.");
  }

  try {
    if (
      bitmap.width <= 0 ||
      bitmap.height <= 0 ||
      bitmap.width * bitmap.height > DOCUMENT_LIMITS.imagePixels
    )
      throw new ImageImportError("The image must be 16 megapixels or smaller.");

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context)
      throw new ImageImportError("Image processing is unavailable.");
    context.drawImage(bitmap, 0, 0);
    const normalizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(
                new ImageImportError("The image could not be normalized."),
              ),
        mimeType,
        mimeType === "image/jpeg" ? 0.9 : undefined,
      );
    });
    if (normalizedBlob.size > DOCUMENT_LIMITS.imageBytes)
      throw new ImageImportError(
        "The normalized image is larger than the 5 MiB limit.",
      );
    return {
      bytes: await normalizedBlob.arrayBuffer(),
      height: bitmap.height,
      id: USER_LOGO_ASSET_ID,
      mimeType,
      width: bitmap.width,
    };
  } finally {
    bitmap.close();
  }
}
