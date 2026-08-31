import { View } from "@react-pdf/renderer";
import { Barcode } from "../../primitives/barcode";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "../../primitives/composable-table";
import { DataTable, type DataTableColumn } from "../../primitives/data-table";
import { DocumentFrame } from "../../primitives/document-frame";
import { Graph } from "../../primitives/graph";
import { Stack } from "../../primitives/stack";
import { getPdfTheme } from "../../themes/themes";
import { resolveFormat } from "../../core/formats";

const printColumns = [
  { key: "document", label: "Document", width: 70 },
  { key: "copies", label: "Copies", width: 30, align: "right" },
] as const;
const smallPage = resolveFormat("a4");

export function TableExample() {
  if (smallPage.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={smallPage}
      theme={getPdfTheme("neutral")}
      margin={36}
    >
      <TableHeader columns={printColumns} measuredHeight={24} />
      <Table columns={printColumns}>
        <TableRow measuredHeight={32}>
          <TableCell column="document">Business cards</TableCell>
          <TableCell column="copies">80</TableCell>
        </TableRow>
        <TableRow measuredHeight={32}>
          <TableCell column="document">Event tickets</TableCell>
          <TableCell column="copies">120</TableCell>
        </TableRow>
      </Table>
    </DocumentFrame>
  );
}

interface PrintRow {
  id: string;
  document: string;
  copies: number;
}
const dataColumns: readonly DataTableColumn<PrintRow>[] = [
  { ...printColumns[0], cell: (row) => row.document },
  { ...printColumns[1], cell: (row) => row.copies },
];
const printRows: readonly PrintRow[] = [
  { id: "cards", document: "Business cards", copies: 80 },
  { id: "tickets", document: "Event tickets", copies: 120 },
  { id: "labels", document: "Product labels", copies: 60 },
];

export function DataTableExample() {
  if (smallPage.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={smallPage}
      theme={getPdfTheme("neutral")}
      margin={36}
    >
      <TableHeader columns={dataColumns} measuredHeight={24} />
      <DataTable
        columns={dataColumns}
        data={printRows}
        rowKey={(row) => row.id}
        rowHeight={() => 32}
      />
    </DocumentFrame>
  );
}
export function GraphExample() {
  return (
    <Graph
      type="bar"
      title="Documents prepared"
      seriesLabel="Copies"
      width={360}
      height={230}
      data={[
        { label: "Cards", value: 80 },
        { label: "Tickets", value: 120 },
        { label: "Labels", value: 60 },
      ]}
    />
  );
}
export function BarcodeExample() {
  return (
    <Stack gap="xl">
      <View>
        <Barcode format="code128" value="DOCN-2026-0042" />
      </View>
      <View>
        <Barcode format="ean13" value="5901234123457" />
      </View>
    </Stack>
  );
}
