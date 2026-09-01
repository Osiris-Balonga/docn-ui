import { Table, TableCell, TableRow } from "./composable-table";
import { useFlowFrame } from "./flow-context";
import { usePdfTheme } from "./theme-context";
import { prepareTableRows, type DataTableColumn } from "./table-data";
import { Text } from "./text";

export interface DataTableProps<T> {
  /** Typed column definitions and cell mapping functions. */
  columns: readonly DataTableColumn<T>[];
  /** Validated rows rendered in source order. */
  data: readonly T[];
  /** Stable key for each printable row. */
  rowKey(row: T, index: number): string;
  /** Qualified row height in PDF points. */
  rowHeight(row: T, index: number): number;
  /** Printed message used when data is empty. */
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  rowHeight,
  emptyMessage = "No rows to display.",
}: DataTableProps<T>) {
  const frame = useFlowFrame();
  const theme = usePdfTheme();
  const rows = prepareTableRows(
    columns,
    data,
    rowKey,
    rowHeight,
    frame,
    Math.max(28, theme.typeScale.body * 1.35 + 14.5),
  );
  return (
    <Table columns={columns}>
      {rows.length ? (
        rows.map((row) => (
          <TableRow key={row.key} measuredHeight={row.height}>
            {columns.map((column, index) => (
              <TableCell key={column.key} column={column.key}>
                {row.cells[index]!}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <Text tone="muted">{emptyMessage}</Text>
      )}
    </Table>
  );
}
export type { DataTableColumn } from "./table-data";
