import { describe, expect, it } from "vitest";
import { resolveFormat } from "../core/formats";
import { createFlowFrame } from "./flow-layout";
import { assertPageNumberFormat } from "./pagination";
import {
  assertTableColumns,
  assertTableHeight,
  prepareTableRows,
  type TableColumn,
} from "./table-data";

const format = resolveFormat("a4");
if (format.kind !== "fixed") throw new Error("Expected A4.");
const frame = createFlowFrame(format, {
  margin: 36,
  header: { height: 64, gap: 12 },
  footer: { height: 20, gap: 12 },
});
const columns = [
  {
    key: "name",
    label: "Name",
    width: 70,
    cell: (row: { name: string; value: number }) => row.name,
  },
  {
    key: "value",
    label: "Value",
    width: 30,
    cell: (row: { name: string; value: number }) => row.value,
  },
];

describe("table and pagination contracts", () => {
  it("validates unique bounded columns and complete percentage widths", () => {
    expect(() => assertTableColumns(columns)).not.toThrow();
    for (const invalid of [
      [],
      [{ key: "a", label: "A", width: 0 }],
      [{ key: "a", label: "A", width: NaN }],
      [{ key: "a", label: "A", width: 50 }],
      [
        { key: "a", label: "A", width: 50 },
        { key: "a", label: "B", width: 50 },
      ],
      [{ key: "a", label: " ", width: 100 }],
      [{ key: "a", label: "A", width: 100, align: "middle" }],
      Array.from({ length: 13 }, (_, index) => ({
        key: String(index),
        label: "A",
        width: 100 / 13,
      })),
    ])
      expect(() =>
        assertTableColumns(invalid as readonly TableColumn[]),
      ).toThrow();
  });

  it("retains typed cell values and rejects oversized rows, duplicate keys and invalid data", () => {
    const rows = [
      { name: "Élodie", value: 0 },
      { name: "Second", value: 12 },
    ];
    expect(
      prepareTableRows(
        columns,
        rows,
        (row) => row.name,
        () => 28,
        frame,
        28,
      ),
    ).toEqual([
      { key: "Élodie", height: 28, cells: ["Élodie", 0] },
      { key: "Second", height: 28, cells: ["Second", 12] },
    ]);
    expect(
      prepareTableRows(
        columns,
        [],
        () => "",
        () => 28,
        frame,
        28,
      ),
    ).toEqual([]);
    for (const badRows of [
      [{ name: "a".repeat(2001), value: 1 }],
      [{ name: "Bad", value: NaN }],
      [{ name: "Bad", value: Infinity }],
      Array.from({ length: 501 }, (_, index) => ({
        name: String(index),
        value: 1,
      })),
    ])
      expect(() =>
        prepareTableRows(
          columns,
          badRows,
          (_, index) => String(index),
          () => 28,
          frame,
          28,
        ),
      ).toThrow();
    expect(() =>
      prepareTableRows(
        columns,
        rows,
        () => "same",
        () => 28,
        frame,
        28,
      ),
    ).toThrow();
    expect(() =>
      prepareTableRows(
        columns,
        rows,
        () => "",
        () => 28,
        frame,
        28,
      ),
    ).toThrow();
    expect(() =>
      prepareTableRows(
        columns,
        rows,
        (row) => row.name,
        () => frame.body.height + 1,
        frame,
        28,
      ),
    ).toThrowError(expect.objectContaining({ code: "LAYOUT_OVERFLOW" }));
  });

  it("includes row padding and refuses a tall non-breaking row before rendering", () => {
    expect(() =>
      assertTableHeight(28, frame, 28, ["row", "height"]),
    ).not.toThrow();
    expect(() =>
      assertTableHeight(frame.body.height, frame, 28, ["row", "height"]),
    ).not.toThrow();
    for (const height of [0, -1, 27, NaN, Infinity, frame.body.height + 0.1]) {
      expect(() =>
        assertTableHeight(height, frame, 28, ["row", "height"]),
      ).toThrowError(expect.objectContaining({ code: "LAYOUT_OVERFLOW" }));
    }
  });

  it("accepts bounded page-number formats with no unresolved placeholder syntax", () => {
    for (const value of [
      "{page}",
      "Page {page} of {pages}",
      "Ledger {page} / {pages}",
    ])
      expect(() => assertPageNumberFormat(value)).not.toThrow();
    for (const value of [
      "",
      "{pages}",
      "{page} {total}",
      "{page",
      "{page}" + "x".repeat(120),
    ])
      expect(() => assertPageNumberFormat(value)).toThrow();
  });
});
