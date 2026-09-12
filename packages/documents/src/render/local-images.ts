import * as upngNamespace from "@pdf-lib/upng";
import { decode as decodeJpeg } from "jpeg-js";
import * as pakoNamespace from "pako";
import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import {
  parseLocalImageId,
  type LocalImageDescriptor,
  type LocalImageId,
  type LocalImageMimeType,
} from "../template-contract";

export interface LocalImageSource {
  readonly bytes: Uint8Array;
  readonly declaredMimeType: LocalImageMimeType;
}

export type LocalImageResolver = (
  id: LocalImageId,
) => Promise<LocalImageSource>;

export interface PreparedLocalImage {
  readonly bytes: Uint8Array;
  readonly descriptor: LocalImageDescriptor;
}

export type PreparedLocalImages = readonly PreparedLocalImage[];

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;
const MAX_JPEG_MEMORY_MB = 128;
const MAX_PNG_CHUNKS = 4_096;
const PNG_INFLATE_CHUNK_BYTES = 16 * 1024;

type UpngApi = typeof import("@pdf-lib/upng");

function resolveUpngApi(value: unknown): UpngApi {
  let candidate = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (
      candidate !== null &&
      typeof candidate === "object" &&
      "decode" in candidate &&
      typeof candidate.decode === "function" &&
      "encode" in candidate &&
      typeof candidate.encode === "function" &&
      "toRGBA8" in candidate &&
      typeof candidate.toRGBA8 === "function"
    ) {
      return candidate as UpngApi;
    }
    candidate =
      candidate !== null &&
      typeof candidate === "object" &&
      "default" in candidate
        ? candidate.default
        : undefined;
  }
  throw new Error("The @pdf-lib/upng codec did not expose its expected API.");
}

const upng = resolveUpngApi(upngNamespace);

interface PakoInflate {
  err: number;
  msg: string;
  onData(chunk: Uint8Array): void;
  push(data: Uint8Array, final: boolean): boolean;
}

interface PakoApi {
  Inflate: new (options?: { chunkSize?: number }) => PakoInflate;
}

function resolvePakoApi(value: unknown): PakoApi {
  let candidate = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (
      candidate !== null &&
      typeof candidate === "object" &&
      "Inflate" in candidate &&
      typeof candidate.Inflate === "function"
    ) {
      return candidate as PakoApi;
    }
    candidate =
      candidate !== null &&
      typeof candidate === "object" &&
      "default" in candidate
        ? candidate.default
        : undefined;
  }
  throw new Error("The pako codec did not expose its expected API.");
}

const pako = resolvePakoApi(pakoNamespace);

const CRC32_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return crc >>> 0;
});

function fail(
  code: "ASSET_REJECTED" | "LIMIT_EXCEEDED",
  message: string,
  path: readonly (number | string)[],
): never {
  throw new DocumentValidationError([{ code, message, path }]);
}

function readUint16(bytes: Uint8Array, offset: number, littleEndian: boolean) {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint16(offset, littleEndian);
}

function readUint32(bytes: Uint8Array, offset: number, littleEndian = false) {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint32(offset, littleEndian);
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ (CRC32_TABLE[(crc ^ byte) & 0xff] ?? 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function readExifOrientation(
  tiff: Uint8Array,
  path: readonly (number | string)[],
): number {
  if (tiff.byteLength < 8)
    fail("ASSET_REJECTED", "Invalid EXIF metadata.", path);
  const byteOrder = String.fromCharCode(tiff[0] ?? 0, tiff[1] ?? 0);
  if (byteOrder !== "II" && byteOrder !== "MM") {
    fail("ASSET_REJECTED", "Invalid EXIF byte order.", path);
  }
  const littleEndian = byteOrder === "II";
  if (readUint16(tiff, 2, littleEndian) !== 42) {
    fail("ASSET_REJECTED", "Invalid EXIF header.", path);
  }
  const directoryOffset = readUint32(tiff, 4, littleEndian);
  if (directoryOffset > tiff.byteLength - 2) {
    fail("ASSET_REJECTED", "Invalid EXIF directory offset.", path);
  }
  const entryCount = readUint16(tiff, directoryOffset, littleEndian);
  if (entryCount > 512)
    fail("ASSET_REJECTED", "EXIF metadata is too large.", path);
  for (let index = 0; index < entryCount; index += 1) {
    const offset = directoryOffset + 2 + index * 12;
    if (offset > tiff.byteLength - 12) {
      fail("ASSET_REJECTED", "Invalid EXIF directory entry.", path);
    }
    if (readUint16(tiff, offset, littleEndian) !== 0x0112) continue;
    const type = readUint16(tiff, offset + 2, littleEndian);
    const count = readUint32(tiff, offset + 4, littleEndian);
    if (type !== 3 || count !== 1) {
      fail("ASSET_REJECTED", "Invalid EXIF orientation value.", path);
    }
    const orientation = readUint16(tiff, offset + 8, littleEndian);
    if (orientation < 1 || orientation > 8) {
      fail("ASSET_REJECTED", "EXIF orientation must be between 1 and 8.", path);
    }
    return orientation;
  }
  return 1;
}

function expectedPngInflatedBytes(
  width: number,
  height: number,
  bitsPerPixel: number,
  interlace: number,
) {
  const passSize = (
    startX: number,
    startY: number,
    stepX: number,
    stepY: number,
  ) => {
    const passWidth = width <= startX ? 0 : Math.ceil((width - startX) / stepX);
    const passHeight =
      height <= startY ? 0 : Math.ceil((height - startY) / stepY);
    return passWidth === 0 || passHeight === 0
      ? 0
      : passHeight * (1 + Math.ceil((passWidth * bitsPerPixel) / 8));
  };
  if (interlace === 0) return passSize(0, 0, 1, 1);
  return (
    passSize(0, 0, 8, 8) +
    passSize(4, 0, 8, 8) +
    passSize(0, 4, 4, 8) +
    passSize(2, 0, 4, 4) +
    passSize(0, 2, 2, 4) +
    passSize(1, 0, 2, 2) +
    passSize(0, 1, 1, 2)
  );
}

function assertBoundedPngInflate(
  compressedParts: readonly Uint8Array[],
  expectedBytes: number,
  path: readonly (number | string)[],
) {
  const compressedLength = compressedParts.reduce(
    (total, part) => total + part.byteLength,
    0,
  );
  const compressed = new Uint8Array(compressedLength);
  let compressedOffset = 0;
  for (const part of compressedParts) {
    compressed.set(part, compressedOffset);
    compressedOffset += part.byteLength;
  }

  const inflater = new pako.Inflate({ chunkSize: PNG_INFLATE_CHUNK_BYTES });
  let inflatedBytes = 0;
  let exceeded = false;
  inflater.onData = (chunk) => {
    inflatedBytes += chunk.byteLength;
    if (inflatedBytes > expectedBytes) {
      exceeded = true;
      throw new Error("PNG_RASTER_LIMIT");
    }
  };
  try {
    inflater.push(compressed, true);
  } catch {
    if (exceeded) {
      fail(
        "LIMIT_EXCEEDED",
        "PNG raster data exceeds its declared dimensions.",
        path,
      );
    }
    fail("ASSET_REJECTED", "PNG raster data could not be decompressed.", path);
  }
  if (exceeded) {
    fail(
      "LIMIT_EXCEEDED",
      "PNG raster data exceeds its declared dimensions.",
      path,
    );
  }
  if (inflater.err !== 0 || inflatedBytes !== expectedBytes) {
    fail(
      "ASSET_REJECTED",
      inflater.msg || "PNG raster data does not match its declared dimensions.",
      path,
    );
  }
}

function inspectPng(bytes: Uint8Array, path: readonly (number | string)[]) {
  if (
    bytes.byteLength < 33 ||
    PNG_SIGNATURE.some((value, index) => bytes[index] !== value)
  ) {
    fail("ASSET_REJECTED", "Image bytes are not a valid PNG.", path);
  }
  let width = 0;
  let height = 0;
  let bitsPerPixel = 0;
  let interlace = 0;
  let orientation = 1;
  let offset = 8;
  let chunkCount = 0;
  let sawHeader = false;
  let sawImageData = false;
  let imageDataEnded = false;
  let sawEnd = false;
  const compressedParts: Uint8Array[] = [];
  while (offset <= bytes.byteLength - 12) {
    chunkCount += 1;
    if (chunkCount > MAX_PNG_CHUNKS) {
      fail("LIMIT_EXCEEDED", "PNG contains too many chunks.", path);
    }
    const length = readUint32(bytes, offset);
    const end = offset + 12 + length;
    if (end > bytes.byteLength) {
      fail("ASSET_REJECTED", "PNG contains a truncated chunk.", path);
    }
    const typeBytes = bytes.slice(offset + 4, offset + 8);
    const type = String.fromCharCode(...typeBytes);
    if (!/^[A-Za-z]{4}$/.test(type)) {
      fail("ASSET_REJECTED", "PNG contains an invalid chunk type.", path);
    }
    const expectedCrc = readUint32(bytes, offset + 8 + length);
    const actualCrc = crc32(bytes.slice(offset + 4, offset + 8 + length));
    if (actualCrc !== expectedCrc) {
      fail("ASSET_REJECTED", `PNG chunk ${type} has an invalid CRC.`, path);
    }
    if (!sawHeader) {
      if (type !== "IHDR" || length !== 13) {
        fail(
          "ASSET_REJECTED",
          "PNG must begin with one 13-byte IHDR chunk.",
          path,
        );
      }
      sawHeader = true;
      width = readUint32(bytes, offset + 8);
      height = readUint32(bytes, offset + 12);
      const bitDepth = bytes[offset + 16] ?? 0;
      const colorType = bytes[offset + 17] ?? 255;
      const channels = new Map([
        [0, 1],
        [2, 3],
        [3, 1],
        [4, 2],
        [6, 4],
      ]).get(colorType);
      const validDepths = new Map<number, readonly number[]>([
        [0, [1, 2, 4, 8, 16]],
        [2, [8, 16]],
        [3, [1, 2, 4, 8]],
        [4, [8, 16]],
        [6, [8, 16]],
      ]).get(colorType);
      if (
        channels === undefined ||
        !validDepths?.includes(bitDepth) ||
        bytes[offset + 18] !== 0 ||
        bytes[offset + 19] !== 0 ||
        (bytes[offset + 20] !== 0 && bytes[offset + 20] !== 1)
      ) {
        fail("ASSET_REJECTED", "PNG has an unsupported IHDR encoding.", path);
      }
      interlace = bytes[offset + 20] ?? 0;
      bitsPerPixel = bitDepth * channels;
    } else if (type === "IHDR") {
      fail("ASSET_REJECTED", "PNG contains more than one IHDR chunk.", path);
    }
    if (type === "acTL") {
      fail("ASSET_REJECTED", "Animated PNG images are not supported.", path);
    }
    if (type === "eXIf") {
      orientation = readExifOrientation(
        bytes.slice(offset + 8, offset + 8 + length),
        path,
      );
    }
    if (type === "IDAT") {
      if (imageDataEnded) {
        fail("ASSET_REJECTED", "PNG IDAT chunks must be consecutive.", path);
      }
      sawImageData = true;
      compressedParts.push(bytes.slice(offset + 8, offset + 8 + length));
    } else if (sawImageData && type !== "IEND") {
      imageDataEnded = true;
    }
    const critical =
      typeBytes[0] !== undefined && typeBytes[0] >= 65 && typeBytes[0] <= 90;
    if (critical && !["IHDR", "PLTE", "IDAT", "IEND"].includes(type)) {
      fail(
        "ASSET_REJECTED",
        `PNG contains unknown critical chunk ${type}.`,
        path,
      );
    }
    offset = end;
    if (type === "IEND") {
      if (length !== 0 || offset !== bytes.byteLength) {
        fail(
          "ASSET_REJECTED",
          "PNG has an invalid end or trailing bytes.",
          path,
        );
      }
      sawEnd = true;
      break;
    }
  }
  if (!sawHeader || !sawImageData || !sawEnd) {
    fail("ASSET_REJECTED", "PNG is missing required chunks.", path);
  }
  assertDimensions(width, height, path);
  const expectedInflatedBytes = expectedPngInflatedBytes(
    width,
    height,
    bitsPerPixel,
    interlace,
  );
  assertBoundedPngInflate(compressedParts, expectedInflatedBytes, path);
  return { height, orientation, width };
}

function inspectJpeg(bytes: Uint8Array, path: readonly (number | string)[]) {
  if (bytes.byteLength < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    fail("ASSET_REJECTED", "Image bytes are not a valid JPEG.", path);
  }
  let width = 0;
  let height = 0;
  let orientation = 1;
  let offset = 2;
  while (offset < bytes.byteLength) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === undefined || marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset > bytes.byteLength - 2) {
      fail("ASSET_REJECTED", "JPEG contains a truncated segment.", path);
    }
    const length = readUint16(bytes, offset, false);
    if (length < 2 || offset + length > bytes.byteLength) {
      fail("ASSET_REJECTED", "JPEG contains an invalid segment length.", path);
    }
    const dataOffset = offset + 2;
    const dataLength = length - 2;
    if (
      marker === 0xe1 &&
      dataLength >= 6 &&
      String.fromCharCode(...bytes.slice(dataOffset, dataOffset + 6)) ===
        "Exif\u0000\u0000"
    ) {
      orientation = readExifOrientation(
        bytes.slice(dataOffset + 6, dataOffset + dataLength),
        path,
      );
    }
    if (
      [
        0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
        0xcf,
      ].includes(marker)
    ) {
      if (dataLength < 6) fail("ASSET_REJECTED", "Invalid JPEG frame.", path);
      height = readUint16(bytes, dataOffset + 1, false);
      width = readUint16(bytes, dataOffset + 3, false);
    }
    offset += length;
  }
  if (width < 1 || height < 1) {
    fail("ASSET_REJECTED", "JPEG dimensions could not be read.", path);
  }
  return { height, orientation, width };
}

function stripJpegMetadata(
  bytes: Uint8Array,
  path: readonly (number | string)[],
): Uint8Array {
  const parts: Uint8Array[] = [bytes.slice(0, 2)];
  let offset = 2;
  let sawScan = false;
  let sawEnd = false;
  while (offset < bytes.byteLength) {
    const markerStart = offset;
    if (bytes[offset] !== 0xff) {
      fail(
        "ASSET_REJECTED",
        "JPEG contains data outside an entropy scan.",
        path,
      );
    }
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === undefined) {
      fail("ASSET_REJECTED", "JPEG contains a truncated marker.", path);
    }
    if (marker === 0xda) {
      if (offset > bytes.byteLength - 2) {
        fail("ASSET_REJECTED", "JPEG contains a truncated scan header.", path);
      }
      const length = readUint16(bytes, offset, false);
      if (length < 2 || offset + length > bytes.byteLength) {
        fail("ASSET_REJECTED", "JPEG contains an invalid scan header.", path);
      }
      const scanStart = offset + length;
      parts.push(bytes.slice(markerStart, scanStart));
      sawScan = true;
      offset = scanStart;
      const entropyStart = offset;
      while (offset < bytes.byteLength) {
        if (bytes[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const nextMarkerStart = offset;
        while (bytes[offset] === 0xff) offset += 1;
        const entropyMarker = bytes[offset];
        if (entropyMarker === undefined) {
          fail(
            "ASSET_REJECTED",
            "JPEG contains a truncated entropy scan.",
            path,
          );
        }
        offset += 1;
        if (
          entropyMarker === 0x00 ||
          (entropyMarker >= 0xd0 && entropyMarker <= 0xd7)
        ) {
          continue;
        }
        parts.push(bytes.slice(entropyStart, nextMarkerStart));
        offset = nextMarkerStart;
        break;
      }
      if (offset >= bytes.byteLength) {
        fail(
          "ASSET_REJECTED",
          "JPEG entropy scan is missing an end marker.",
          path,
        );
      }
      continue;
    }
    if (marker === 0xd9) {
      if (!sawScan || offset !== bytes.byteLength) {
        fail(
          "ASSET_REJECTED",
          "JPEG has an invalid end or trailing bytes.",
          path,
        );
      }
      parts.push(bytes.slice(markerStart, offset));
      sawEnd = true;
      break;
    }
    if (marker === 0x01) {
      parts.push(bytes.slice(markerStart, offset));
      continue;
    }
    if (
      marker === 0x00 ||
      marker === 0xd8 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      fail(
        "ASSET_REJECTED",
        "JPEG contains an invalid marker outside a scan.",
        path,
      );
    }
    if (offset > bytes.byteLength - 2) {
      fail("ASSET_REJECTED", "JPEG contains a truncated segment.", path);
    }
    const length = readUint16(bytes, offset, false);
    if (length < 2 || offset + length > bytes.byteLength) {
      fail("ASSET_REJECTED", "JPEG contains an invalid segment length.", path);
    }
    const end = offset + length;
    const metadata =
      (marker >= 0xe1 && marker <= 0xed) || marker === 0xef || marker === 0xfe;
    if (!metadata) parts.push(bytes.slice(markerStart, end));
    offset = end;
  }
  if (!sawEnd) {
    fail("ASSET_REJECTED", "JPEG is missing its end marker.", path);
  }
  const byteLength = parts.reduce((total, part) => total + part.byteLength, 0);
  const result = new Uint8Array(byteLength);
  let cursor = 0;
  for (const part of parts) {
    result.set(part, cursor);
    cursor += part.byteLength;
  }
  return result;
}

function sniffMimeType(
  bytes: Uint8Array,
  path: readonly (number | string)[],
): LocalImageMimeType {
  if (PNG_SIGNATURE.every((value, index) => bytes[index] === value)) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  return fail(
    "ASSET_REJECTED",
    "Only PNG and JPEG images are supported.",
    path,
  );
}

function assertDimensions(
  width: number,
  height: number,
  path: readonly (number | string)[],
) {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > DOCUMENT_LIMITS.imagePixels
  ) {
    fail(
      "LIMIT_EXCEEDED",
      `Local image exceeds ${DOCUMENT_LIMITS.imagePixels} pixels.`,
      path,
    );
  }
}

function orientRgba(
  pixels: Uint8Array,
  width: number,
  height: number,
  orientation: number,
) {
  const swapsAxes = orientation >= 5;
  const outputWidth = swapsAxes ? height : width;
  const outputHeight = swapsAxes ? width : height;
  const output = new Uint8Array(outputWidth * outputHeight * 4);
  for (let y = 0; y < outputHeight; y += 1) {
    for (let x = 0; x < outputWidth; x += 1) {
      let sourceX = x;
      let sourceY = y;
      if (orientation === 2) sourceX = width - 1 - x;
      if (orientation === 3) {
        sourceX = width - 1 - x;
        sourceY = height - 1 - y;
      }
      if (orientation === 4) sourceY = height - 1 - y;
      if (orientation === 5) {
        sourceX = y;
        sourceY = x;
      }
      if (orientation === 6) {
        sourceX = y;
        sourceY = height - 1 - x;
      }
      if (orientation === 7) {
        sourceX = width - 1 - y;
        sourceY = height - 1 - x;
      }
      if (orientation === 8) {
        sourceX = width - 1 - y;
        sourceY = x;
      }
      const sourceOffset = (sourceY * width + sourceX) * 4;
      const outputOffset = (y * outputWidth + x) * 4;
      output.set(pixels.subarray(sourceOffset, sourceOffset + 4), outputOffset);
    }
  }
  return { height: outputHeight, pixels: output, width: outputWidth };
}

function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer;
}

async function digest(bytes: Uint8Array): Promise<`sha256:${string}`> {
  const result = await globalThis.crypto.subtle.digest(
    "SHA-256",
    exactArrayBuffer(bytes),
  );
  return `sha256:${Array.from(new Uint8Array(result), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

function decodeAndNormalize(
  bytes: Uint8Array,
  mimeType: LocalImageMimeType,
  path: readonly (number | string)[],
): {
  readonly bytes: Uint8Array;
  readonly height: number;
  readonly mimeType: LocalImageMimeType;
  readonly width: number;
} {
  const inspection =
    mimeType === "image/png"
      ? inspectPng(bytes, path)
      : inspectJpeg(bytes, path);
  assertDimensions(inspection.width, inspection.height, path);
  let rgba: Uint8Array;
  try {
    if (mimeType === "image/png") {
      const decoded = upng.decode(exactArrayBuffer(bytes));
      if (decoded.frames.length > 0) {
        fail("ASSET_REJECTED", "Animated PNG images are not supported.", path);
      }
      const frame = upng.toRGBA8(decoded)[0];
      if (!frame) fail("ASSET_REJECTED", "PNG contains no image frame.", path);
      rgba = new Uint8Array(frame);
    } else {
      const decoded = decodeJpeg(bytes, {
        formatAsRGBA: true,
        maxMemoryUsageInMB: MAX_JPEG_MEMORY_MB,
        maxResolutionInMP: 16,
        tolerantDecoding: false,
        useTArray: true,
      });
      if (
        decoded.width !== inspection.width ||
        decoded.height !== inspection.height
      ) {
        fail("ASSET_REJECTED", "JPEG dimensions changed during decode.", path);
      }
      rgba = new Uint8Array(decoded.data);
    }
  } catch (error) {
    if (error instanceof DocumentValidationError) throw error;
    fail("ASSET_REJECTED", "Image pixels could not be decoded.", path);
  }
  if (rgba.byteLength !== inspection.width * inspection.height * 4) {
    fail("ASSET_REJECTED", "Decoded image pixels are incomplete.", path);
  }
  const oriented = orientRgba(
    rgba,
    inspection.width,
    inspection.height,
    inspection.orientation,
  );
  const encoded =
    mimeType === "image/jpeg" && inspection.orientation === 1
      ? stripJpegMetadata(bytes, path)
      : new Uint8Array(
          upng.encode(
            [exactArrayBuffer(oriented.pixels)],
            oriented.width,
            oriented.height,
            0,
          ),
        );
  if (encoded.byteLength > DOCUMENT_LIMITS.imageBytes) {
    fail(
      "LIMIT_EXCEEDED",
      "Normalized local image exceeds the 5 MiB limit.",
      path,
    );
  }
  return {
    bytes: encoded,
    height: oriented.height,
    mimeType:
      mimeType === "image/jpeg" && inspection.orientation === 1
        ? "image/jpeg"
        : "image/png",
    width: oriented.width,
  };
}

async function resolveLocalImageSource(
  id: LocalImageId,
  resolver: LocalImageResolver,
): Promise<{ bytes: Uint8Array; declaredMimeType: LocalImageMimeType }> {
  const path = ["data", "localImageIds", id] as const;
  try {
    const source: unknown = await resolver(id);
    if (
      source === null ||
      typeof source !== "object" ||
      Array.isArray(source)
    ) {
      fail(
        "ASSET_REJECTED",
        "Local image resolver returned an invalid source.",
        path,
      );
    }
    const prototype = Object.getPrototypeOf(source);
    if (prototype !== Object.prototype && prototype !== null) {
      fail(
        "ASSET_REJECTED",
        "Local image resolver source must be a plain object.",
        path,
      );
    }
    const descriptors = Object.getOwnPropertyDescriptors(source);
    const keys = Reflect.ownKeys(descriptors);
    if (
      keys.length !== 2 ||
      !keys.includes("bytes") ||
      !keys.includes("declaredMimeType") ||
      keys.some((key) => typeof key !== "string")
    ) {
      fail(
        "ASSET_REJECTED",
        "Local image resolver source has unknown fields.",
        path,
      );
    }
    const bytesProperty = descriptors.bytes;
    const mimeProperty = descriptors.declaredMimeType;
    const bytes = bytesProperty?.value as unknown;
    const declaredMimeType = mimeProperty?.value as unknown;
    if (
      !bytesProperty ||
      !mimeProperty ||
      bytesProperty.get ||
      bytesProperty.set ||
      mimeProperty.get ||
      mimeProperty.set ||
      !(bytes instanceof Uint8Array) ||
      (declaredMimeType !== "image/png" && declaredMimeType !== "image/jpeg")
    ) {
      fail(
        "ASSET_REJECTED",
        "Local image resolver returned an invalid source.",
        path,
      );
    }
    return {
      bytes: new Uint8Array(bytes),
      declaredMimeType,
    };
  } catch (error) {
    if (error instanceof DocumentValidationError) throw error;
    return fail(
      "ASSET_REJECTED",
      `Local image "${id}" could not be resolved.`,
      path,
    );
  }
}

export async function preflightLocalImages(
  imageIds: readonly LocalImageId[],
  resolver: LocalImageResolver,
): Promise<PreparedLocalImages> {
  if (imageIds.length > DOCUMENT_LIMITS.permittedAssets) {
    fail(
      "LIMIT_EXCEEDED",
      `A template may use at most ${DOCUMENT_LIMITS.permittedAssets} local images.`,
      ["data", "localImageIds"],
    );
  }
  const canonicalIds = imageIds.map((id, index) =>
    parseLocalImageId(id, ["data", "localImageIds", index]),
  );
  if (new Set(canonicalIds).size !== canonicalIds.length) {
    fail("ASSET_REJECTED", "Local image IDs must be unique.", [
      "data",
      "localImageIds",
    ]);
  }
  const prepared: PreparedLocalImage[] = [];
  for (const id of [...canonicalIds].sort()) {
    const source = await resolveLocalImageSource(id, resolver);
    const ownedInput = source.bytes;
    if (
      ownedInput.byteLength < 1 ||
      ownedInput.byteLength > DOCUMENT_LIMITS.imageBytes
    ) {
      fail("LIMIT_EXCEEDED", "Local image exceeds the 5 MiB limit.", [
        "data",
        "localImageIds",
        id,
      ]);
    }
    const path = ["data", "localImageIds", id] as const;
    const sniffedMimeType = sniffMimeType(ownedInput, path);
    if (sniffedMimeType !== source.declaredMimeType) {
      fail(
        "ASSET_REJECTED",
        "Declared image MIME type does not match its bytes.",
        path,
      );
    }
    const normalized = decodeAndNormalize(ownedInput, sniffedMimeType, path);
    const normalizedBytes = new Uint8Array(normalized.bytes);
    prepared.push(
      Object.freeze({
        bytes: normalizedBytes,
        descriptor: Object.freeze({
          byteLength: normalizedBytes.byteLength,
          heightPx: normalized.height,
          id,
          mimeType: normalized.mimeType,
          sha256: await digest(normalizedBytes),
          widthPx: normalized.width,
        }),
      }),
    );
  }
  return Object.freeze(prepared);
}
