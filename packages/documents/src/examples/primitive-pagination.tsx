import { Document, View } from "@react-pdf/renderer";
import { resolveFormat } from "../core/formats";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "../primitives/composable-table";
import { DataTable, type DataTableColumn } from "../primitives/data-table";
import { DocumentFrame } from "../primitives/document-frame";
import { Divider, Stack } from "../primitives/layout";
import { PageFooter, PageHeader } from "../primitives/page-regions";
import { KeepTogether, PageBreak } from "../primitives/pagination";
import { Heading, KeyValue, Text } from "../primitives/typography";
import type { FixedDocumentRenderPlan } from "../render/runtime";
import { getPdfTheme } from "../themes/themes";

export interface PaginationRow {
  id: string;
  description: string;
  quantity: number;
  amount: string;
  height: number;
}
export const paginationColumns = [
  {
    key: "description",
    label: "Description",
    width: 60,
    cell: (row) => row.description,
  },
  {
    key: "quantity",
    label: "Qty",
    width: 12,
    align: "right",
    cell: (row) => row.quantity,
  },
  {
    key: "amount",
    label: "Amount",
    width: 28,
    align: "right",
    cell: (row) => row.amount,
  },
] as const satisfies readonly DataTableColumn<PaginationRow>[];

export const paginationRows: readonly PaginationRow[] = Array.from(
  { length: 40 },
  (_, index) => ({
    id: `entry-${index + 1}`,
    description: `Entry ${String(index + 1).padStart(3, "0")}${index === 0 ? " - A longer description that wraps while keeping its quantity and amount on the same physical page." : " - Document preparation and review"}`,
    quantity: 1,
    amount: "25.00",
    // Measured for this bounded fixture at 60% of the A4 body width with 9 pt Noto Sans.
    height: index === 0 ? 44 : 28,
  }),
);

export function createPrimitivePaginationPlan(): FixedDocumentRenderPlan {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected A4.");
  const fixedDate = new Date("2026-01-15T12:00:00.000Z");
  return {
    format,
    printProfile: { kind: "screen" },
    document: (
      <Document
        title="Reusable pagination and tables"
        creationDate={fixedDate}
        modificationDate={fixedDate}
        language="en-GB"
      >
        <DocumentFrame
          format={format}
          theme={getPdfTheme("neutral")}
          margin={36}
          header={{
            height: 64,
            gap: 12,
            content: (
              <PageHeader>
                <Stack gap="xs">
                  <Heading>Production ledger</Heading>
                  <Text size="caption" tone="muted">
                    DOCN-UI / REUSABLE PAGINATION
                  </Text>
                  <TableHeader
                    columns={paginationColumns}
                    measuredHeight={24}
                  />
                </Stack>
              </PageHeader>
            ),
          }}
          footer={{
            height: 20,
            gap: 12,
            content: (
              <PageFooter pageNumber={{ format: "Ledger {page} / {pages}" }}>
                <Text size="caption" tone="muted">
                  hello@example.com
                </Text>
              </PageFooter>
            ),
          }}
        >
          <DataTable
            columns={paginationColumns}
            data={paginationRows}
            rowKey={(row) => row.id}
            rowHeight={(row) => row.height}
          />
          <KeepTogether measuredHeight={220}>
            <View style={{ paddingTop: 16 }}>
              <Stack gap="md">
                <Heading>Final summary</Heading>
                <KeyValue
                  orientation="horizontal"
                  label="Entries reviewed"
                  value="40"
                />
                <KeyValue
                  orientation="horizontal"
                  label="Total"
                  value="1,000.00"
                />
                <Divider />
                <Text>
                  The summary and its reserved sign-off space stay together.
                </Text>
                <View
                  style={{
                    height: 72,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#cccccc",
                  }}
                />
                <Text size="caption">SUMMARY-END</Text>
              </Stack>
            </View>
          </KeepTogether>
          <PageBreak>
            <Stack gap="md">
              <Heading>Verification appendix</Heading>
              <Text>
                This explicit page break starts a separately composed table.
              </Text>
              <Table columns={paginationColumns}>
                <TableRow measuredHeight={28}>
                  <TableCell column="description">
                    Manual verification entry
                  </TableCell>
                  <TableCell column="quantity">1</TableCell>
                  <TableCell column="amount">25.00</TableCell>
                </TableRow>
              </Table>
              <DataTable
                columns={paginationColumns}
                data={[]}
                rowKey={(row) => row.id}
                rowHeight={(row) => row.height}
                emptyMessage="No outstanding entries."
              />
              <Text size="caption">APPENDIX-END</Text>
            </Stack>
          </PageBreak>
        </DocumentFrame>
      </Document>
    ),
  };
}
