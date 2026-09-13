import * as upngNamespace from "@pdf-lib/upng";
import { deflateSync } from "node:zlib";
import { decode as decodeJpeg, encode as encodeJpeg } from "jpeg-js";
import { describe, expect, it } from "vitest";
import { parseLocalImageId } from "../template-contract";
import { DOCUMENT_LIMITS } from "../core/contracts";
import { createNodeLocalImageRenderScope } from "./local-images.node";
import { preflightLocalImages } from "./local-images";

type UpngApi = typeof import("@pdf-lib/upng");

function resolveUpngApi(value: unknown): UpngApi {
  let candidate = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (
      candidate !== null &&
      typeof candidate === "object" &&
      "decode" in candidate &&
      typeof candidate.decode === "function" &&
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
  throw new Error("UPNG test decoder is unavailable.");
}

const upng = resolveUpngApi(upngNamespace);
const asymmetricPixels = new Uint8Array([
  255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 0, 255,
  255, 0, 255, 255, 255,
]);

function png() {
  return new Uint8Array(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQMAAADO7O3JAAAABlBMVEX/AAAAAP9sof2OAAAACklEQVR4nGNwAAAAQgBBKTf07wAAAABJRU5ErkJggg==",
      "base64",
    ),
  );
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concat(parts: readonly Uint8Array[]) {
  const result = new Uint8Array(
    parts.reduce((total, part) => total + part.byteLength, 0),
  );
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

function pngChunk(type: string, data: Uint8Array) {
  const result = new Uint8Array(12 + data.byteLength);
  const view = new DataView(result.buffer);
  view.setUint32(0, data.byteLength);
  result.set(new TextEncoder().encode(type), 4);
  result.set(data, 8);
  view.setUint32(
    8 + data.byteLength,
    crc32(result.slice(4, 8 + data.byteLength)),
  );
  return result;
}

function decompressionBombPng() {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, 1);
  view.setUint32(4, 1);
  header.set([8, 6, 0, 0, 0], 8);
  return concat([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", new Uint8Array(deflateSync(Buffer.alloc(64 * 1024)))),
    pngChunk("IEND", new Uint8Array()),
  ]);
}

function encodedJpeg() {
  return new Uint8Array(
    encodeJpeg({ data: asymmetricPixels, width: 2, height: 3 }, 100).data,
  );
}

function exifSegment(orientation: number) {
  const tiff = new Uint8Array([
    0x49,
    0x49,
    0x2a,
    0x00,
    0x08,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x12,
    0x01,
    0x03,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    orientation,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ]);
  const payload = new Uint8Array(6 + tiff.byteLength);
  payload.set([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
  payload.set(tiff, 6);
  const segmentLength = payload.byteLength + 2;
  return concat([
    new Uint8Array([0xff, 0xe1, segmentLength >> 8, segmentLength & 0xff]),
    payload,
  ]);
}

function jpegWithOrientation(orientation: number) {
  const encoded = encodedJpeg();
  return concat([
    encoded.slice(0, 2),
    exifSegment(orientation),
    encoded.slice(2),
  ]);
}

function jpegWithPostScanOrientation(orientation: number) {
  const encoded = encodedJpeg();
  const endOffset = encoded.byteLength - 2;
  return concat([
    encoded.slice(0, endOffset),
    exifSegment(orientation),
    encoded.slice(endOffset),
  ]);
}

function jpegSegment(marker: number, text: string) {
  const payload = new TextEncoder().encode(text);
  const length = payload.byteLength + 2;
  return concat([
    new Uint8Array([0xff, marker, length >> 8, length & 0xff]),
    payload,
  ]);
}

function addPostScanMetadata(bytes: Uint8Array) {
  const endOffset = bytes.byteLength - 2;
  expect(Array.from(bytes.slice(endOffset))).toEqual([0xff, 0xd9]);
  return concat([
    bytes.slice(0, endOffset),
    jpegSegment(0xe1, "late-app"),
    jpegSegment(0xfe, "late-comment"),
    bytes.slice(endOffset),
  ]);
}

function orientForTest(
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
      output.set(
        pixels.subarray(sourceOffset, sourceOffset + 4),
        (y * outputWidth + x) * 4,
      );
    }
  }
  return { height: outputHeight, pixels: output, width: outputWidth };
}

describe("local image preflight", () => {
  it("decodes and deterministically normalizes an owned PNG copy", async () => {
    const source = png();
    const prepared = await preflightLocalImages(
      [parseLocalImageId("brand-mark")],
      async () => ({ bytes: source, declaredMimeType: "image/png" }),
    );
    const baseline = new Uint8Array(prepared[0]!.bytes);
    source.fill(0);
    expect(prepared[0]?.descriptor).toMatchObject({
      heightPx: 1,
      id: "brand-mark",
      mimeType: "image/png",
      widthPx: 2,
    });
    expect(prepared[0]?.descriptor.sha256).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(prepared[0]?.bytes).toEqual(baseline);
  });

  it("applies every non-identity EXIF orientation to asymmetric pixels", async () => {
    for (let orientation = 2; orientation <= 8; orientation += 1) {
      const source = jpegWithOrientation(orientation);
      const decodedSource = decodeJpeg(source, {
        formatAsRGBA: true,
        tolerantDecoding: false,
        useTArray: true,
      });
      const expected = orientForTest(
        new Uint8Array(decodedSource.data),
        decodedSource.width,
        decodedSource.height,
        orientation,
      );
      const prepared = await preflightLocalImages(
        [parseLocalImageId(`portrait-${orientation}`)],
        async () => ({ bytes: source, declaredMimeType: "image/jpeg" }),
      );
      const decodedPng = upng.decode(prepared[0]!.bytes.slice().buffer);
      const frame = upng.toRGBA8(decodedPng)[0];
      if (!frame) throw new Error("Expected one decoded PNG frame.");
      expect(prepared[0]?.descriptor).toMatchObject({
        heightPx: expected.height,
        mimeType: "image/png",
        widthPx: expected.width,
      });
      expect(new Uint8Array(frame)).toEqual(expected.pixels);
    }
  });

  it("applies EXIF orientation discovered after an entropy scan", async () => {
    const source = jpegWithPostScanOrientation(6);
    const baseline = decodeJpeg(encodedJpeg(), {
      formatAsRGBA: true,
      tolerantDecoding: false,
      useTArray: true,
    });
    const expected = orientForTest(
      new Uint8Array(baseline.data),
      baseline.width,
      baseline.height,
      6,
    );
    const prepared = await preflightLocalImages(
      [parseLocalImageId("post-scan-exif")],
      async () => ({ bytes: source, declaredMimeType: "image/jpeg" }),
    );
    const decodedPng = upng.decode(prepared[0]!.bytes.slice().buffer);
    const frame = upng.toRGBA8(decodedPng)[0];
    if (!frame) throw new Error("Expected one decoded PNG frame.");

    expect(prepared[0]?.descriptor).toMatchObject({
      heightPx: expected.height,
      mimeType: "image/png",
      widthPx: expected.width,
    });
    expect(new Uint8Array(frame)).toEqual(expected.pixels);
  });

  it("strips JPEG metadata before and after scans and rejects trailing bytes", async () => {
    const source = addPostScanMetadata(jpegWithOrientation(1));
    const prepared = await preflightLocalImages(
      [parseLocalImageId("photo")],
      async () => ({ bytes: source, declaredMimeType: "image/jpeg" }),
    );
    const normalizedText = new TextDecoder().decode(prepared[0]!.bytes);
    expect(prepared[0]?.descriptor.mimeType).toBe("image/jpeg");
    expect(Array.from(prepared[0]!.bytes.slice(0, 2))).toEqual([255, 216]);
    expect(prepared[0]!.bytes.byteLength).toBeLessThan(source.byteLength);
    expect(normalizedText).not.toContain("Exif");
    expect(normalizedText).not.toContain("late-app");
    expect(normalizedText).not.toContain("late-comment");

    await expect(
      preflightLocalImages([parseLocalImageId("trailing")], async () => ({
        bytes: concat([jpegWithOrientation(1), new Uint8Array([1, 2, 3])]),
        declaredMimeType: "image/jpeg",
      })),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });

  it("rejects an EXIF orientation outside the bounded 1–8 range", async () => {
    await expect(
      preflightLocalImages([parseLocalImageId("portrait")], async () => ({
        bytes: jpegWithOrientation(9),
        declaredMimeType: "image/jpeg",
      })),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });

  it("rejects image byte and pixel limits before allocating decoded pixels", async () => {
    const oversized = new Uint8Array(DOCUMENT_LIMITS.imageBytes + 1);
    oversized.set(png());
    const excessivePixels = png();
    const header = excessivePixels.slice(16, 29);
    const view = new DataView(header.buffer);
    view.setUint32(0, 4_001);
    view.setUint32(4, 4_000);
    excessivePixels.set(pngChunk("IHDR", header), 8);

    for (const bytes of [oversized, excessivePixels]) {
      await expect(
        preflightLocalImages([parseLocalImageId("oversized")], async () => ({
          bytes,
          declaredMimeType: "image/png",
        })),
      ).rejects.toMatchObject({
        code: "LIMIT_EXCEEDED",
        issues: [
          expect.objectContaining({
            path: ["data", "localImageIds", "oversized"],
          }),
        ],
      });
    }
  });

  it("rejects invalid PNG CRCs and bounded-inflate violations", async () => {
    const invalidCrc = png();
    invalidCrc[20] = (invalidCrc[20] ?? 0) ^ 1;
    await expect(
      preflightLocalImages([parseLocalImageId("bad-crc")], async () => ({
        bytes: invalidCrc,
        declaredMimeType: "image/png",
      })),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
    await expect(
      preflightLocalImages([parseLocalImageId("bomb")], async () => ({
        bytes: decompressionBombPng(),
        declaredMimeType: "image/png",
      })),
    ).rejects.toMatchObject({ code: "LIMIT_EXCEEDED" });
  });

  it("snapshots plain resolver data and rejects accessors or proxy failures", async () => {
    let getterReads = 0;
    const accessorSource = Object.defineProperty(
      { declaredMimeType: "image/png" },
      "bytes",
      {
        enumerable: true,
        get() {
          getterReads += 1;
          return png();
        },
      },
    );
    await expect(
      preflightLocalImages(
        [parseLocalImageId("accessor")],
        async () => accessorSource as never,
      ),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
    expect(getterReads).toBe(0);

    await expect(
      preflightLocalImages(
        [parseLocalImageId("proxy")],
        async () =>
          new Proxy(
            {},
            {
              ownKeys() {
                throw new Error("untrusted proxy");
              },
            },
          ) as never,
      ),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });

  it("rejects a MIME mismatch and isolates the Node render scope", async () => {
    await expect(
      preflightLocalImages([parseLocalImageId("brand-mark")], async () => ({
        bytes: png(),
        declaredMimeType: "image/jpeg",
      })),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
    const prepared = await preflightLocalImages(
      [parseLocalImageId("brand-mark")],
      async () => ({ bytes: png(), declaredMimeType: "image/png" }),
    );
    const scope = createNodeLocalImageRenderScope(prepared);
    const source = scope.lookup.get(
      parseLocalImageId("brand-mark"),
    )?.resolvedSource;
    prepared[0]!.bytes.fill(0);
    expect(source).toMatch(/^data:image\/png;base64,/);
    expect(scope.lookup.size).toBe(1);
    scope.dispose();
    scope.dispose();
    expect(scope.lookup.size).toBe(0);
  });
});
