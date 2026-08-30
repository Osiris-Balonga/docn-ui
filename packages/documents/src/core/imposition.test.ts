import { describe, expect, it } from "vitest";
import { DocumentValidationError } from "./errors";
import { imposeLabelSheet } from "./imposition";

const a4Sheet = {
  pageWidthMm: 210,
  pageHeightMm: 297,
  labelWidthMm: 70,
  labelHeightMm: 37,
  marginsMm: { top: 10, right: 0, bottom: 10, left: 0 },
  columnGapMm: 0,
  rowGapMm: 2,
  startingCell: 0,
  quantity: 21,
} as const;

describe("label sheet imposition", () => {
  it("places the first and last cells in row-major order inside the page", () => {
    const result = imposeLabelSheet(a4Sheet);

    expect(result).toMatchObject({
      columns: 3,
      rows: 7,
      capacityPerPage: 21,
      pageCount: 1,
    });
    expect(result.placements[0]).toMatchObject({
      itemIndex: 0,
      pageIndex: 0,
      cellIndex: 0,
      row: 0,
      column: 0,
      xMm: 0,
      yMm: 10,
    });
    expect(result.placements.at(-1)).toMatchObject({
      itemIndex: 20,
      pageIndex: 0,
      cellIndex: 20,
      row: 6,
      column: 2,
      xMm: 140,
      yMm: 244,
    });
  });

  it("uses the starting cell only on page one and resumes at cell zero", () => {
    const result = imposeLabelSheet({
      ...a4Sheet,
      startingCell: 19,
      quantity: 4,
    });

    expect(result.pageCount).toBe(2);
    expect(
      result.placements.map(({ itemIndex, pageIndex, cellIndex }) => ({
        itemIndex,
        pageIndex,
        cellIndex,
      })),
    ).toEqual([
      { itemIndex: 0, pageIndex: 0, cellIndex: 19 },
      { itemIndex: 1, pageIndex: 0, cellIndex: 20 },
      { itemIndex: 2, pageIndex: 1, cellIndex: 0 },
      { itemIndex: 3, pageIndex: 1, cellIndex: 1 },
    ]);
  });

  it("rejects negative, impossible, and out-of-capacity geometry", () => {
    expect(() =>
      imposeLabelSheet({
        ...a4Sheet,
        marginsMm: { ...a4Sheet.marginsMm, left: -1 },
      }),
    ).toThrowError(DocumentValidationError);
    expect(() =>
      imposeLabelSheet({ ...a4Sheet, labelWidthMm: 220 }),
    ).toThrowError(expect.objectContaining({ code: "LAYOUT_OVERFLOW" }));
    expect(() =>
      imposeLabelSheet({ ...a4Sheet, startingCell: 21 }),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["sheet", "startingCell"] })],
      }),
    );
  });
});
