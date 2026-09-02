import { describe, expect, it } from "vitest";
import { DocumentValidationError } from "./errors";
import {
  calculateMonetaryDocument,
  calculateMonetaryLine,
  formatMinorAmount,
} from "./money";

describe("minor-unit money", () => {
  it("keeps zero and zero-decimal currencies exact", () => {
    expect(
      calculateMonetaryLine({
        quantity: 0,
        unitPriceMinor: 9_999,
        taxRateBasisPoints: 2_000,
      }),
    ).toEqual({ subtotalMinor: 0, taxMinor: 0, totalMinor: 0 });
    expect(formatMinorAmount(125_000, "XAF", "fr")).toBe("125 000 XAF");
  });

  it("rounds each line tax half up in minor units", () => {
    expect(
      calculateMonetaryLine({
        quantity: 1,
        unitPriceMinor: 5,
        taxRateBasisPoints: 1_000,
      }),
    ).toEqual({ subtotalMinor: 5, taxMinor: 1, totalMinor: 6 });
    expect(formatMinorAmount(6, "EUR", "en")).toBe("0.06 EUR");
  });

  it("sums line subtotals and individually rounded taxes", () => {
    expect(
      calculateMonetaryDocument([
        { quantity: 2, unitPriceMinor: 125, taxRateBasisPoints: 2_000 },
        { quantity: 1, unitPriceMinor: 333, taxRateBasisPoints: 550 },
      ]),
    ).toEqual({
      lines: [
        { subtotalMinor: 250, taxMinor: 50, totalMinor: 300 },
        { subtotalMinor: 333, taxMinor: 18, totalMinor: 351 },
      ],
      subtotalMinor: 583,
      taxMinor: 68,
      totalMinor: 651,
    });
  });

  it("rejects unsafe inputs and calculated overflow", () => {
    const cases = [
      { quantity: 1.5, unitPriceMinor: 100, taxRateBasisPoints: 0 },
      {
        quantity: Number.MAX_SAFE_INTEGER,
        unitPriceMinor: 2,
        taxRateBasisPoints: 0,
      },
    ];
    for (const input of cases) {
      expect(() => calculateMonetaryLine(input)).toThrowError(
        DocumentValidationError,
      );
      try {
        calculateMonetaryLine(input);
      } catch (error) {
        expect(error).toMatchObject({ code: "LIMIT_EXCEEDED" });
      }
    }
  });
});
