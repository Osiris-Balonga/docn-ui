import { encode as encodeJpeg } from "jpeg-js";
import { describe, expect, it } from "vitest";
import { parseLocalImageId } from "../template-contract";
import { createNodeLocalImageRenderScope } from "./local-images.node";
import { preflightLocalImages } from "./local-images";

function png() {
  return new Uint8Array(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQMAAADO7O3JAAAABlBMVEX/AAAAAP9sof2OAAAACklEQVR4nGNwAAAAQgBBKTf07wAAAABJRU5ErkJggg==",
      "base64",
    ),
  );
}

function jpegWithOrientation(orientation: number) {
  const pixels = new Uint8Array([255, 0, 0, 255, 0, 0, 255, 255]);
  const encoded = new Uint8Array(
    encodeJpeg({ data: pixels, width: 2, height: 1 }, 90).data,
  );
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
  const result = new Uint8Array(encoded.byteLength + payload.byteLength + 4);
  result.set(encoded.subarray(0, 2));
  result.set([0xff, 0xe1, segmentLength >> 8, segmentLength & 0xff], 2);
  result.set(payload, 6);
  result.set(encoded.subarray(2), 6 + payload.byteLength);
  return result;
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

  it("applies bounded JPEG EXIF orientation and strips metadata into PNG", async () => {
    const prepared = await preflightLocalImages(
      [parseLocalImageId("portrait")],
      async () => ({
        bytes: jpegWithOrientation(6),
        declaredMimeType: "image/jpeg",
      }),
    );

    expect(prepared[0]?.descriptor).toMatchObject({
      heightPx: 2,
      mimeType: "image/png",
      widthPx: 1,
    });
    expect(Array.from(prepared[0]!.bytes.slice(0, 8))).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
  });

  it("keeps an unrotated JPEG compact while stripping its EXIF segment", async () => {
    const source = jpegWithOrientation(1);
    const prepared = await preflightLocalImages(
      [parseLocalImageId("photo")],
      async () => ({ bytes: source, declaredMimeType: "image/jpeg" }),
    );

    expect(prepared[0]?.descriptor.mimeType).toBe("image/jpeg");
    expect(Array.from(prepared[0]!.bytes.slice(0, 2))).toEqual([255, 216]);
    expect(prepared[0]!.bytes.byteLength).toBeLessThan(source.byteLength);
    expect(new TextDecoder().decode(prepared[0]!.bytes)).not.toContain("Exif");
  });

  it("rejects an EXIF orientation outside the bounded 1–8 range", async () => {
    await expect(
      preflightLocalImages([parseLocalImageId("portrait")], async () => ({
        bytes: jpegWithOrientation(9),
        declaredMimeType: "image/jpeg",
      })),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });

  it("rejects a declared MIME mismatch and isolates the Node scope", async () => {
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
