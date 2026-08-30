import { describe, expect, it } from "vitest";
import { parseLabelData } from "./schema";

const label = {
  id: "item-001",
  title: "Studio notebook",
  lines: ["A5", "Ruled"],
};

describe("label data", () => {
  it("accepts one repeatable label and rejects unintended ordered-list duplication", () => {
    expect(
      parseLabelData({
        labels: [label],
        export: {
          mode: "sheet",
          pageFormatId: "a4",
          marginsMm: { top: 10, right: 10, bottom: 10, left: 10 },
          columnGapMm: 2,
          rowGapMm: 2,
          startingCell: 0,
          quantity: 24,
        },
      }).export,
    ).toMatchObject({ mode: "sheet", quantity: 24 });

    expect(() =>
      parseLabelData({
        labels: [label, label],
        export: { mode: "individual" },
      }),
    ).toThrowError(expect.objectContaining({ code: "INVALID_DATA" }));
  });
});
