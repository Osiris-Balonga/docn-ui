import { describe, expect, it } from "vitest";
import {
  ImageImportError,
  detectImageMimeType,
  validateImageEnvelope,
} from "./image-import";

describe("local image validation", () => {
  it("trusts bounded PNG/JPEG signatures instead of names or declared types", () => {
    const png = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(detectImageMimeType(png)).toBe("image/png");
    expect(detectImageMimeType(jpeg)).toBe("image/jpeg");
    expect(
      detectImageMimeType(new TextEncoder().encode("<svg></svg>")),
    ).toBeUndefined();
    expect(() => validateImageEnvelope(new Uint8Array())).toThrow(
      ImageImportError,
    );
    expect(() =>
      validateImageEnvelope(new TextEncoder().encode("%PDF")),
    ).toThrow("Choose a valid PNG or JPEG image.");
  });
});
