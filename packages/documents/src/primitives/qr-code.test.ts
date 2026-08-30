import { describe, expect, it } from "vitest";
import { createPrintableQrGeometry } from "./qr-code";

describe("printable QR geometry", () => {
  it("includes the four-module quiet zone in physical module sizing", () => {
    const geometry = createPrintableQrGeometry(
      "docn-ticket:DSB-2026-0042",
      112,
      1.25,
    );
    expect(geometry.quietZone).toBe(4);
    expect(geometry.totalModules).toBe(geometry.matrixSize + 8);
    expect(geometry.moduleSize).toBeGreaterThanOrEqual(1.25);
  });

  it("reports content that cannot meet the selected print density", () => {
    expect(() =>
      createPrintableQrGeometry("dense:" + "x".repeat(300), 64, 1.25),
    ).toThrowError(
      expect.objectContaining({
        code: "QR_TOO_DENSE",
      }),
    );
  });
});
