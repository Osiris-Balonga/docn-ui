import { describe, expect, it } from "vitest";
import { resolveFormat } from "../core/formats";
import {
  inspectContinuousTextContent,
  qualifyFinalContinuousPdf,
  type ContinuousPdfInspection,
  type ContinuousTextItem,
} from "./continuous-measurement";

const format = (() => {
  const value = resolveFormat("receipt-58");
  if (value.kind !== "continuous") throw new Error("Expected receipt format.");
  return value;
})();

const marker = "FINAL_MARKER";

function textItem(
  str: string,
  x = 10,
  y = 20,
  width = 50,
  height = 6,
): ContinuousTextItem {
  return { height, str, transform: [1, 0, 0, 1, x, y], width };
}

function inspection(
  items: readonly ContinuousTextItem[],
): ContinuousPdfInspection {
  return {
    items,
    pageCount: 1,
    pageHeight: 100,
    pageWidth: format.widthPt,
    pageXMax: format.widthPt,
    pageXMin: 0,
    pageYMax: 100,
    pageYMin: 0,
  };
}

function expectFinalQualificationFailure(value: ContinuousPdfInspection) {
  let failure: unknown;
  try {
    qualifyFinalContinuousPdf(value, format, marker);
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({
    code: "RENDER_FAILED",
    issues: [{ path: ["document"] }],
  });
  expect(String(failure)).not.toContain(marker);
}

describe("continuous final PDF qualification", () => {
  it("accepts an exact terminal marker item or normalized item sequence", () => {
    expect(() =>
      qualifyFinalContinuousPdf(inspection([textItem(marker)]), format, marker),
    ).not.toThrow();
    expect(() =>
      qualifyFinalContinuousPdf(
        inspection([
          textItem("FINAL_", 10, 20, 25),
          textItem("MARKER", 35, 20, 25),
        ]),
        format,
        marker,
      ),
    ).not.toThrow();
  });

  it("uses the same normalized terminal sequence for the probe and final PDF", () => {
    const items = [
      textItem("FINAL_", 10, 20, 25),
      textItem("MARKER", 35, 20, 25),
    ];
    expect(inspectContinuousTextContent(1, 100, items, marker)).toEqual({
      pageCount: 1,
      usedHeightPt: 86,
    });
    expect(() =>
      qualifyFinalContinuousPdf(inspection(items), format, marker),
    ).not.toThrow();

    const spacedItems = [
      textItem(" FINAL", 10, 20, 25),
      textItem("MARKER ", 35, 20, 25),
    ];
    expect(() =>
      inspectContinuousTextContent(1, 100, spacedItems, "FINAL MARKER"),
    ).not.toThrow();
    expect(() =>
      qualifyFinalContinuousPdf(
        inspection(spacedItems),
        format,
        "FINAL MARKER",
      ),
    ).not.toThrow();
  });

  it.each([
    [
      "different lines",
      [textItem("FINAL_", 10, 30, 25), textItem("MARKER", 35, 20, 25)],
    ],
    [
      "distant fragments",
      [textItem("FINAL_", 10, 20, 25), textItem("MARKER", 80, 20, 25)],
    ],
    [
      "excessively overlapping fragments",
      [textItem("FINAL_", 10, 20, 25), textItem("MARKER", 20, 20, 25)],
    ],
  ])(
    "rejects a spatially incoherent terminal sequence: %s",
    (_label, items) => {
      expect(() => inspectContinuousTextContent(1, 100, items, marker)).toThrow(
        "The continuous final marker was not rendered.",
      );
      expectFinalQualificationFailure(inspection(items));
    },
  );

  it.each([
    ["prefix in one item", [textItem(`NOT_${marker}`)]],
    ["suffix in one item", [textItem(`${marker}_NOT`)]],
    [
      "adjacent prefix item",
      [textItem("NOT_", 0, 20, 10), textItem(marker, 10, 20, 50)],
    ],
  ])("rejects a marker collision: %s", (_label, items) => {
    expectFinalQualificationFailure(inspection(items));
  });

  it.each([
    ["below", textItem(marker, 10, 5, 50, 6)],
    ["above", textItem(marker, 10, 98, 50, 6)],
    ["left", textItem(marker, -1, 20, 50, 6)],
    ["right", textItem(marker, format.widthPt - 20, 20, 30, 6)],
  ])("rejects a marker glyph box outside the MediaBox: %s", (_label, item) => {
    expectFinalQualificationFailure(inspection([item]));
  });
});
