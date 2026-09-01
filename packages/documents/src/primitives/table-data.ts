import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import { assertFlowBlockFits, type FlowFrame } from "./flow-layout";

export interface TableColumn {
  /** Stable column identifier. */
  key: string;
  /** Printable header label. */
  label: string;
  /** Percentage width; all columns must total 100. */
  width: number;
  /** Text alignment for header and cells. */
  align?: "left" | "right";
}
export type TableValue = string | number;
export interface DataTableColumn<T> extends TableColumn {
  /** Maps one typed row to a printable string or number. */
  cell(row: T): TableValue;
}
export interface PreparedTableRow {
  key: string;
  height: number;
  cells: readonly TableValue[];
}
export const TABLE_LIMITS = { columns: 12, rows: 500 } as const;

function invalid(message: string, path: readonly (string | number)[]): never {
  throw new DocumentValidationError([
    { code: "INVALID_DATA", message, path: ["table", ...path] },
  ]);
}

export function assertTableColumns(columns: readonly TableColumn[]): void {
  if (
    !Array.isArray(columns) ||
    !columns.length ||
    columns.length > TABLE_LIMITS.columns
  )
    invalid("A table requires one to twelve columns.", ["columns"]);
  const keys = new Set<string>();
  let width = 0;
  for (const [index, column] of columns.entries()) {
    if (
      !column ||
      typeof column.key !== "string" ||
      !column.key.trim() ||
      column.key.length > 128 ||
      keys.has(column.key) ||
      typeof column.label !== "string" ||
      !column.label.trim() ||
      column.label.length > 128 ||
      !Number.isFinite(column.width) ||
      column.width <= 0 ||
      (column.align !== undefined && !["left", "right"].includes(column.align))
    )
      invalid(
        "Use unique column keys, bounded labels, positive percentage widths and left/right alignment.",
        ["columns", index],
      );
    keys.add(column.key);
    width += column.width;
  }
  if (Math.abs(width - 100) > 0.001)
    invalid("Column percentage widths must total 100.", ["columns"]);
}

export function assertTableValue(
  value: TableValue,
  path: readonly (string | number)[],
): void {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    (typeof value === "number" && !Number.isFinite(value)) ||
    (typeof value === "string" &&
      value.length > DOCUMENT_LIMITS.generalStringCharacters)
  )
    invalid("Table cells require bounded strings or finite numbers.", path);
}

export function assertTableHeight(
  height: number,
  frame: FlowFrame,
  minimum: number,
  path: readonly (string | number)[],
): void {
  assertFlowBlockFits(height, frame, ["table", ...path]);
  if (height < minimum)
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message:
          "The declared table height must include text, padding and borders.",
        path: ["table", ...path],
      },
    ]);
}

export function prepareTableRows<T>(
  columns: readonly DataTableColumn<T>[],
  data: readonly T[],
  rowKey: (row: T, index: number) => string,
  rowHeight: (row: T, index: number) => number,
  frame: FlowFrame,
  minimum: number,
): PreparedTableRow[] {
  assertTableColumns(columns);
  if (!Array.isArray(data) || data.length > TABLE_LIMITS.rows)
    invalid("A data table supports at most 500 rows.", ["rows"]);
  if (
    typeof rowKey !== "function" ||
    typeof rowHeight !== "function" ||
    columns.some((column) => typeof column.cell !== "function")
  )
    invalid("Data table accessors must be trusted functions.", ["columns"]);
  const keys = new Set<string>();
  return data.map((row, index) => {
    const key = rowKey(row, index);
    if (
      typeof key !== "string" ||
      !key.trim() ||
      key.length > 128 ||
      keys.has(key)
    )
      invalid(
        "Data table row keys must be unique non-empty strings of at most 128 characters.",
        ["rows", index, "key"],
      );
    keys.add(key);
    const height = rowHeight(row, index);
    assertTableHeight(height, frame, minimum, ["rows", index, "height"]);
    const cells = columns.map((column) => {
      const value = column.cell(row);
      assertTableValue(value, ["rows", index, column.key]);
      return value;
    });
    return { key, height, cells };
  });
}
