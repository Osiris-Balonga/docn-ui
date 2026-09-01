import { Document, View } from "@react-pdf/renderer";
import { resolveFormat } from "../core/formats";
import { Barcode } from "../primitives/barcode";
import { TableHeader } from "../primitives/composable-table";
import { DataTable, type DataTableColumn } from "../primitives/data-table";
import { DocumentFrame } from "../primitives/document-frame";
import { Graph, type GraphDatum } from "../primitives/graph";
import { Heading } from "../primitives/heading";
import { PageFooter } from "../primitives/page-footer";
import { Stack } from "../primitives/stack";
import { Text } from "../primitives/text";
import { getPdfTheme } from "../themes/themes";

interface PrintOrder {
  id: string;
  label: string;
  copies: number;
}
const orders: readonly PrintOrder[] = [
  { id: "cards", label: "Business cards", copies: 80 },
  { id: "badges", label: "Team badges", copies: 120 },
  { id: "reports", label: "Annual reports", copies: 60 },
];
const columns: readonly DataTableColumn<PrintOrder>[] = [
  { key: "label", label: "Document", width: 70, cell: (row) => row.label },
  {
    key: "copies",
    label: "Copies",
    width: 30,
    align: "right",
    cell: (row) => row.copies,
  },
];
const graphData: readonly GraphDatum[] = orders.map((row) => ({
  label: row.id,
  value: row.copies,
}));

export function ComponentDocument() {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected A4.");
  return (
    <Document
      title="Individually installed PDF components"
      creationDate={new Date("2026-01-15T12:00:00Z")}
      modificationDate={new Date("2026-01-15T12:00:00Z")}
    >
      <DocumentFrame
        format={format}
        theme={getPdfTheme("neutral")}
        margin={36}
        footer={{
          height: 18,
          content: (
            <PageFooter>
              <Text size="caption">Print summary</Text>
            </PageFooter>
          ),
        }}
      >
        <Stack gap="lg">
          <Heading level={1}>Print summary</Heading>
          <Text>
            One composition, installed from independent component entries.
          </Text>
          <View>
            <TableHeader columns={columns} measuredHeight={24} />
            <DataTable
              columns={columns}
              data={orders}
              rowKey={(row) => row.id}
              rowHeight={() => 32}
            />
          </View>
          <Graph
            type="bar"
            title="Copies by document"
            seriesLabel="Copies"
            data={graphData}
            width={400}
          />
          <Barcode format="code128" value="DOCN-2026-0042" />
        </Stack>
      </DocumentFrame>
    </Document>
  );
}
