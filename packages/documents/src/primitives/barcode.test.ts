import { describe, expect, it } from "vitest";
import { millimetersToPoints } from "../core/units";
import { barcodeExamples } from "../examples/primitive-barcodes";
import {
  barcodeTextHeight,
  ean13CheckDigit,
  resolveBarcode,
  type BarcodeProps,
} from "./barcode-data";

describe("validated barcode geometry", () => {
  it("validates supplied EAN digits without repairing or dropping leading zeroes", () => {
    expect(ean13CheckDigit("590123412345")).toBe("7");
    expect(ean13CheckDigit("012345678901")).toBe("2");
    expect(resolveBarcode(barcodeExamples[3]).value).toBe("0123456789012");
    for (const value of [
      "590123412345",
      "5901234123456",
      "5901234123457\n",
      "５901234123457",
    ])
      expect(() => resolveBarcode({ format: "ean13", value })).toThrow();
    expect(() => ean13CheckDigit("123")).toThrow();
  });

  it("bounds printable Code 128 input and rejects unsupported formats/options", () => {
    for (const value of ["", "é", "x\n", "\x01", "\xf1", "x".repeat(81)])
      expect(() => resolveBarcode({ format: "code128", value })).toThrow();
    const spaced = resolveBarcode({ format: "code128", value: " aZ-42 " });
    expect(spaced.value).toBe(" aZ-42 ");
    for (const props of [
      { format: "code39", value: "A" },
      { format: "ean13", value: 123 },
      { ...barcodeExamples[0], showValue: "false" },
    ])
      expect(() => resolveBarcode(props as BarcodeProps)).toThrow();
  });

  it("protects quiet zones, physical module floors and EAN guard extensions", () => {
    for (const example of barcodeExamples) {
      const result = resolveBarcode(example);
      expect(result.bars[0]!.x).toBeCloseTo(
        result.quietLeft * result.moduleWidth,
        8,
      );
      const last = result.bars.at(-1)!;
      expect(result.width - last.x - last.width).toBeCloseTo(
        result.quietRight * result.moduleWidth,
        8,
      );
      expect(
        result.bars.every((bar) => bar.width >= result.moduleWidth - 1e-9),
      ).toBe(true);
      if (example.format === "ean13") {
        expect(
          result.bars.filter((bar) => bar.height > result.barHeight),
        ).toHaveLength(6);
        expect(result.guardHeight).toBeCloseTo(5 * result.moduleWidth);
      }
    }
    expect(resolveBarcode(barcodeExamples[2]).moduleWidth).toBeCloseTo(
      millimetersToPoints(0.25),
      8,
    );
    expect(resolveBarcode(barcodeExamples[3]).moduleWidth).toBeCloseTo(
      millimetersToPoints(0.264),
      8,
    );
    for (const change of [
      { width: NaN },
      { width: -1 },
      { width: 721 },
      { width: 10 },
      { width: 600 },
      { barHeight: 10 },
      { barHeight: Infinity },
      { barHeight: 145 },
    ])
      expect(() =>
        resolveBarcode({ ...barcodeExamples[1], ...change }),
      ).toThrow();
    expect(() =>
      resolveBarcode({
        ...barcodeExamples[3],
        width: barcodeExamples[3].width - 0.01,
      }),
    ).toThrow();
  });

  it("keeps readable text separate and rejects unprintable caption density", () => {
    expect(barcodeTextHeight("5901234123457", 120, 7)).toBeCloseTo(13.8);
    expect(() => barcodeTextHeight("A".repeat(40), 120, 7)).toThrow();
    expect(() => barcodeTextHeight("W".repeat(50), 600, 12)).toThrow();
    expect(() => barcodeTextHeight("ABC", 120, 5)).toThrow();
    expect(resolveBarcode(barcodeExamples[2]).showValue).toBe(false);
  });
});
