import { View } from "@react-pdf/renderer";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type ReactNode,
} from "react";
import { DocumentValidationError } from "../core/errors";
import { useFlowFrame } from "./flow-context";
import { usePdfTheme } from "./theme-context";
import { FlowTableCell, FlowTableHeader, FlowTableRow } from "./table";
import {
  assertTableColumns,
  assertTableHeight,
  assertTableValue,
  type TableColumn,
  type TableValue,
} from "./table-data";

const TableContext = createContext<readonly TableColumn[] | null>(null);
function useTableColumns() {
  const columns = useContext(TableContext);
  if (!columns) throw new Error("TableRow and TableCell require Table.");
  return columns;
}

export interface TableProps {
  columns: readonly TableColumn[];
  children: ReactNode;
}
export function Table({ columns, children }: TableProps) {
  const frame = useFlowFrame();
  assertTableColumns(columns);
  return (
    <TableContext.Provider value={columns}>
      <View style={{ width: frame.body.width }}>{children}</View>
    </TableContext.Provider>
  );
}

export interface TableCellProps {
  column: string;
  children: TableValue;
}
export function TableCell({ column, children }: TableCellProps) {
  const columns = useTableColumns();
  const theme = usePdfTheme();
  const definition = columns.find((item) => item.key === column);
  if (!definition)
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: "Unknown table column.",
        path: ["table", "cells", column],
      },
    ]);
  assertTableValue(children, ["cells", column]);
  return (
    <FlowTableCell
      width={`${definition.width}%`}
      align={definition.align ?? "left"}
      style={{
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale.body,
      }}
    >
      {children}
    </FlowTableCell>
  );
}

export interface TableRowProps {
  children: ReactNode;
  measuredHeight: number;
}
export function TableRow({ children, measuredHeight }: TableRowProps) {
  const columns = useTableColumns();
  const frame = useFlowFrame();
  const theme = usePdfTheme();
  assertTableHeight(
    measuredHeight,
    frame,
    Math.max(28, theme.typeScale.body * 1.35 + 14.5),
    ["row", "height"],
  );
  const cells = Children.toArray(children);
  if (
    cells.length !== columns.length ||
    cells.some(
      (cell, index) =>
        !isValidElement<TableCellProps>(cell) ||
        cell.type !== TableCell ||
        cell.props.column !== columns[index]?.key,
    )
  )
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message:
          "Provide exactly one direct TableCell per column, in column order.",
        path: ["table", "row", "cells"],
      },
    ]);
  return (
    <FlowTableRow borderColor={theme.colors.border} minHeight={measuredHeight}>
      {children}
    </FlowTableRow>
  );
}

export interface TableHeaderProps {
  columns: readonly TableColumn[];
  measuredHeight: number;
}
export function TableHeader({ columns, measuredHeight }: TableHeaderProps) {
  const theme = usePdfTheme();
  const frame = useFlowFrame();
  assertTableColumns(columns);
  assertTableHeight(
    measuredHeight,
    frame,
    theme.typeScale.caption * 1.35 + 12.75,
    ["header", "height"],
  );
  return (
    <FlowTableHeader
      inline
      top={0}
      minHeight={measuredHeight}
      columns={columns.map((column) => ({
        ...column,
        width: `${column.width}%`,
      }))}
      color={theme.colors.text}
      backgroundColor={theme.colors.surface}
      borderColor={theme.colors.border}
      textStyle={{
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale.caption,
        lineHeight: 1.35,
      }}
    />
  );
}
export type { TableColumn, TableValue } from "./table-data";
