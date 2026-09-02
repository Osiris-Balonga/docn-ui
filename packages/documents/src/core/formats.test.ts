import { describe, expect, it } from "vitest";
import { validateRenderRequest, inspectDocumentData } from "./contracts";
import { DocumentValidationError } from "./errors";
import { fingerprintRenderRequest } from "./fingerprint";
import { resolveFormat } from "./formats";

const compatibility = {
  supportedFormatIds: ["card-85x55", "label-custom"] as const,
  supportedThemeIds: ["neutral"] as const,
};

function request(overrides: Record<string, unknown> = {}) {
  return {
    protocolVersion: 1,
    revision: 1,
    templateId: "business-card-minimal",
    templateVersion: "1.0.0",
    data: { name: "E\u0301lodie Mbemba" },
    formatId: "card-85x55",
    themeId: "neutral",
    locale: "fr",
    printProfile: { kind: "screen" },
    assetIds: [],
    ...overrides,
  };
}

describe("document formats and render contracts", () => {
  it("keeps canonical landscape dimensions when orientation is applied once", () => {
    const format = resolveFormat("card-85x55", {
      orientation: "landscape",
    });

    expect(format).toMatchObject({
      kind: "fixed",
      orientation: "landscape",
      trim: { widthMm: 85, heightMm: 55 },
    });
  });

  it("rejects incompatible formats and orientations with field paths", () => {
    expect(() =>
      validateRenderRequest(request({ formatId: "a4" }), compatibility),
    ).toThrowError(
      expect.objectContaining({
        code: "UNSUPPORTED_FORMAT",
        issues: [expect.objectContaining({ path: ["formatId"] })],
      }),
    );
    expect(() =>
      resolveFormat("card-85x55", { orientation: "portrait" }),
    ).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({ path: ["formatOptions", "orientation"] }),
        ],
      }),
    );
  });

  it("validates custom label bounds without overriding preset dimensions", () => {
    expect(() =>
      resolveFormat("label-custom", { widthMm: 39, heightMm: 24 }),
    ).toThrowError(DocumentValidationError);
    expect(() =>
      resolveFormat("card-85x55", { widthMm: 90, heightMm: 50 }),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["formatOptions"] })],
      }),
    );
  });

  it("normalizes accents while retaining invalid values for diagnostics", () => {
    const valid = validateRenderRequest<{ name: string }>(
      request(),
      compatibility,
    );
    expect(valid.request.data.name).toBe("Élodie Mbemba");

    const oversized = "x".repeat(2_001);
    const inspection = inspectDocumentData({ name: oversized });
    expect(inspection.value.name).toBe(oversized);
    expect(inspection.issues).toEqual([
      expect.objectContaining({
        code: "LIMIT_EXCEEDED",
        path: ["data", "name"],
      }),
    ]);
  });

  it("fingerprints normalized inputs independent of object key order", async () => {
    const first = validateRenderRequest(request(), compatibility).request;
    const second = validateRenderRequest(
      request({ data: { name: "Élodie Mbemba" } }),
      compatibility,
    ).request;

    expect(await fingerprintRenderRequest(first)).toBe(
      await fingerprintRenderRequest(second),
    );
    expect(await fingerprintRenderRequest({ ...first, revision: 2 })).not.toBe(
      await fingerprintRenderRequest(first),
    );
  });
});
