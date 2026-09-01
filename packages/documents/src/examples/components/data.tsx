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
import { Heading } from "../../primitives/heading";
import { KeyValue } from "../../primitives/field-pair";
import { Row } from "../../primitives/row";
import { Divider } from "../../primitives/separator";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { getPdfTheme } from "../../themes/themes";
import { resolveFormat } from "../../core/formats";

const printColumns = [
  { key: "description", label: "Description", width: 55 },
  { key: "quantity", label: "Qty", width: 15, align: "right" },
  { key: "amount", label: "Amount", width: 30, align: "right" },
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
      <Stack gap="lg">
        <Heading>Custom quotation</Heading>
        <Text tone="muted">
          Table gives the author direct control over every row and value.
        </Text>
        <TableHeader columns={printColumns} measuredHeight={24} />
        <Table columns={printColumns}>
          <TableRow measuredHeight={32}>
            <TableCell column="description">Editorial design</TableCell>
            <TableCell column="quantity">1</TableCell>
            <TableCell column="amount">840.00 EUR</TableCell>
          </TableRow>
          <TableRow measuredHeight={32}>
            <TableCell column="description">Print preparation</TableCell>
            <TableCell column="quantity">2</TableCell>
            <TableCell column="amount">320.00 EUR</TableCell>
          </TableRow>
          <TableRow measuredHeight={32}>
            <TableCell column="description">Manual subtotal</TableCell>
            <TableCell column="quantity">3</TableCell>
            <TableCell column="amount">1,160.00 EUR</TableCell>
          </TableRow>
        </Table>
        <Row justify="between">
          <Text size="caption" tone="muted">
            Payment due in 14 days.
          </Text>
          <KeyValue label="Total" value="1,160.00 EUR" />
        </Row>
      </Stack>
    </DocumentFrame>
  );
}

export function TableQuotationExample() {
  return <TableExample />;
}

interface PrintRow {
  id: string;
  document: string;
  copies: number;
}
const dataBaseColumns = [
  { key: "document", label: "Document", width: 70 },
  { key: "copies", label: "Copies", width: 30, align: "right" },
] as const;
const dataColumns: readonly DataTableColumn<PrintRow>[] = [
  { ...dataBaseColumns[0], cell: (row) => row.document },
  { ...dataBaseColumns[1], cell: (row) => row.copies },
];
const printRows: readonly PrintRow[] = [
  { id: "cards", document: "Business cards", copies: 80 },
  { id: "tickets", document: "Event tickets", copies: 120 },
  { id: "labels", document: "Product labels", copies: 60 },
  { id: "receipts", document: "Service receipts", copies: 240 },
  { id: "invoices", document: "Invoices", copies: 36 },
  { id: "passes", document: "Event passes", copies: 180 },
];

export function DataTableExample() {
  if (smallPage.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={smallPage}
      theme={getPdfTheme("neutral")}
      margin={36}
    >
      <Stack gap="lg">
        <Heading>Production queue</Heading>
        <Text tone="muted">
          DataTable maps a typed dataset through one reusable column definition.
        </Text>
        <TableHeader columns={dataColumns} measuredHeight={24} />
        <DataTable
          columns={dataColumns}
          data={printRows}
          rowKey={(row) => row.id}
          rowHeight={() => 32}
        />
        <Divider />
        <Heading level={3}>Empty result</Heading>
        <DataTable
          columns={dataColumns}
          data={[]}
          rowKey={(row) => row.id}
          rowHeight={() => 32}
          emptyMessage="No print jobs match this batch."
        />
      </Stack>
    </DocumentFrame>
  );
}
export function DataTableRowsExample() {
  return <DataTableExample />;
}
export function DataTableEmptyExample() {
  if (smallPage.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={smallPage}
      theme={getPdfTheme("neutral")}
      margin={36}
    >
      <Heading>Archived jobs</Heading>
      <TableHeader columns={dataColumns} measuredHeight={24} />
      <DataTable
        columns={dataColumns}
        data={[]}
        rowKey={(row) => row.id}
        rowHeight={() => 32}
        emptyMessage="No archived jobs."
      />
    </DocumentFrame>
  );
}
export function GraphExample() {
  const data = [
    { label: "Cards", value: 80 },
    { label: "Passes", value: 120 },
    { label: "Labels", value: 60 },
  ];
  return (
    <Stack gap="lg">
      <Graph
        type="bar"
        title="Bar"
        seriesLabel="Qty"
        width={360}
        height={165}
        data={data}
      />
      <Graph
        type="horizontal-bar"
        title="H bar"
        seriesLabel="Qty"
        width={360}
        height={165}
        data={data}
      />
      <Graph
        type="line"
        title="Line"
        seriesLabel="Qty"
        width={360}
        height={165}
        data={data}
      />
      <Graph
        type="area"
        title="Area"
        seriesLabel="Qty"
        width={360}
        height={165}
        data={data}
      />
      <Graph
        type="pie"
        title="Pie"
        seriesLabel="Qty"
        width={360}
        height={165}
        data={data}
      />
      <Graph
        type="donut"
        title="Donut"
        seriesLabel="Qty"
        width={360}
        height={165}
        data={data}
      />
    </Stack>
  );
}
const graphRecipeData = [
  { label: "Cards", value: 80 },
  { label: "Tickets", value: 120 },
  { label: "Labels", value: 60 },
] as const;
export function GraphCartesianExample() {
  return (
    <Stack gap="lg">
      <Graph
        type="bar"
        title="Prepared"
        seriesLabel="Copies"
        width={360}
        height={165}
        data={graphRecipeData}
      />
      <Graph
        type="line"
        title="Prepared"
        seriesLabel="Copies"
        width={360}
        height={165}
        data={graphRecipeData}
      />
    </Stack>
  );
}
export function GraphCircularExample() {
  return (
    <Stack gap="lg">
      <Graph
        type="pie"
        title="Share"
        seriesLabel="Copies"
        width={360}
        height={165}
        data={graphRecipeData}
      />
      <Graph
        type="donut"
        title="Share"
        seriesLabel="Copies"
        width={360}
        height={165}
        data={graphRecipeData}
      />
    </Stack>
  );
}
export function BarcodeExample() {
  return (
    <Stack gap="xl">
      <BarcodeCode128Example />
      <BarcodeEan13Example />
      <View>
        <Barcode
          format="code128"
          value="INTERNAL-REF-42"
          width={190}
          barHeight={50}
          showValue={false}
        />
      </View>
    </Stack>
  );
}
export function BarcodeCode128Example() {
  return (
    <View>
      <Barcode format="code128" value="DOCN-2026-0042" />
    </View>
  );
}
export function BarcodeEan13Example() {
  return (
    <View>
      <Barcode
        format="ean13"
        value="5901234123457"
        width={150}
        barHeight={100}
      />
    </View>
  );
}
export function BarcodeMachineOnlyExample() {
  return (
    <View>
      <Barcode
        format="code128"
        value="INTERNAL-REF-42"
        width={190}
        barHeight={50}
        showValue={false}
      />
    </View>
  );
}
