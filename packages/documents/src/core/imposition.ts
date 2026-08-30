import { DocumentValidationError, type DocumentIssue } from "./errors";

export const LABEL_EXPORT_LIMIT = 100;

export interface SheetInsetsMm {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface SheetGeometryInput {
  columnGapMm: number;
  labelHeightMm: number;
  labelWidthMm: number;
  marginsMm: SheetInsetsMm;
  pageHeightMm: number;
  pageWidthMm: number;
  quantity: number;
  rowGapMm: number;
  startingCell: number;
}

export interface SheetCellPlacement {
  cellIndex: number;
  column: number;
  heightMm: number;
  itemIndex: number;
  pageIndex: number;
  row: number;
  widthMm: number;
  xMm: number;
  yMm: number;
}

export interface SheetImposition {
  capacityPerPage: number;
  columns: number;
  pageCount: number;
  placements: readonly SheetCellPlacement[];
  rows: number;
}

function issue(message: string, path: readonly string[]): DocumentIssue {
  return { code: "LAYOUT_OVERFLOW", message, path };
}

function assertFiniteNonnegative(
  value: number,
  path: readonly string[],
  issues: DocumentIssue[],
): void {
  if (!Number.isFinite(value) || value < 0) {
    issues.push(
      issue("Sheet measurements must be finite and nonnegative.", path),
    );
  }
}

function assertFinitePositive(
  value: number,
  path: readonly string[],
  issues: DocumentIssue[],
): void {
  if (!Number.isFinite(value) || value <= 0) {
    issues.push(
      issue("Page and label dimensions must be finite and positive.", path),
    );
  }
}

function throwIssues(issues: DocumentIssue[]): never {
  const [first, ...rest] = issues;
  if (!first) throw new Error("Sheet geometry failed without an issue.");
  throw new DocumentValidationError([first, ...rest]);
}

function cellCount(availableMm: number, cellMm: number, gapMm: number): number {
  return Math.floor((availableMm + gapMm + Number.EPSILON) / (cellMm + gapMm));
}

export function imposeLabelSheet(input: SheetGeometryInput): SheetImposition {
  const issues: DocumentIssue[] = [];
  assertFinitePositive(input.pageWidthMm, ["sheet", "pageWidthMm"], issues);
  assertFinitePositive(input.pageHeightMm, ["sheet", "pageHeightMm"], issues);
  assertFinitePositive(input.labelWidthMm, ["sheet", "labelWidthMm"], issues);
  assertFinitePositive(input.labelHeightMm, ["sheet", "labelHeightMm"], issues);
  assertFiniteNonnegative(input.columnGapMm, ["sheet", "columnGapMm"], issues);
  assertFiniteNonnegative(input.rowGapMm, ["sheet", "rowGapMm"], issues);
  for (const edge of ["top", "right", "bottom", "left"] as const) {
    assertFiniteNonnegative(
      input.marginsMm[edge],
      ["sheet", "marginsMm", edge],
      issues,
    );
  }
  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > LABEL_EXPORT_LIMIT
  ) {
    issues.push(
      issue(
        `Sheet quantity must be an integer from 1 to ${LABEL_EXPORT_LIMIT}.`,
        ["sheet", "quantity"],
      ),
    );
  }
  if (!Number.isInteger(input.startingCell) || input.startingCell < 0) {
    issues.push(
      issue("Starting cell must be a nonnegative integer.", [
        "sheet",
        "startingCell",
      ]),
    );
  }
  if (issues.length > 0) throwIssues(issues);

  const availableWidthMm =
    input.pageWidthMm - input.marginsMm.left - input.marginsMm.right;
  const availableHeightMm =
    input.pageHeightMm - input.marginsMm.top - input.marginsMm.bottom;
  const columns = cellCount(
    availableWidthMm,
    input.labelWidthMm,
    input.columnGapMm,
  );
  const rows = cellCount(
    availableHeightMm,
    input.labelHeightMm,
    input.rowGapMm,
  );
  const capacityPerPage = columns * rows;

  if (columns < 1 || rows < 1 || capacityPerPage < 1) {
    throwIssues([
      issue("The label, margins, and gaps do not fit on the selected page.", [
        "sheet",
      ]),
    ]);
  }
  if (input.startingCell >= capacityPerPage) {
    throwIssues([
      issue(
        `Starting cell must be below the page capacity of ${capacityPerPage}.`,
        ["sheet", "startingCell"],
      ),
    ]);
  }

  const placements: SheetCellPlacement[] = [];
  let itemIndex = 0;
  let pageIndex = 0;
  while (itemIndex < input.quantity) {
    const firstCell = pageIndex === 0 ? input.startingCell : 0;
    for (
      let cellIndex = firstCell;
      cellIndex < capacityPerPage && itemIndex < input.quantity;
      cellIndex += 1
    ) {
      const row = Math.floor(cellIndex / columns);
      const column = cellIndex % columns;
      placements.push({
        itemIndex,
        pageIndex,
        cellIndex,
        row,
        column,
        xMm:
          input.marginsMm.left +
          column * (input.labelWidthMm + input.columnGapMm),
        yMm: input.marginsMm.top + row * (input.labelHeightMm + input.rowGapMm),
        widthMm: input.labelWidthMm,
        heightMm: input.labelHeightMm,
      });
      itemIndex += 1;
    }
    pageIndex += 1;
  }

  return {
    capacityPerPage,
    columns,
    pageCount: pageIndex,
    placements,
    rows,
  };
}
