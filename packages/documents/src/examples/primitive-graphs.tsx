import { Document } from "@react-pdf/renderer";
import { resolveFormat } from "../core/formats";
import { DocumentFrame } from "../primitives/document-frame";
import { Graph, type GraphDatum, type GraphType } from "../primitives/graph";
import { Row, Stack } from "../primitives/layout";
import { Heading, Text } from "../primitives/typography";
import type { FixedDocumentRenderPlan } from "../render/runtime";
import { getPdfTheme } from "../themes/themes";

const monthlyCopies: readonly GraphDatum[] = [
  { label: "Jan", value: 32 },
  { label: "Feb", value: 48 },
  { label: "Mar", value: 24 },
  { label: "Apr", value: 56 },
];
const nominal: readonly (readonly [GraphType, string])[] = [
  ["bar", "Vertical bars"],
  ["horizontal-bar", "Horizontal bars"],
  ["line", "Line graph"],
  ["area", "Area graph"],
  ["pie", "Pie graph"],
  ["donut", "Donut graph"],
];

export function createPrimitiveGraphsPlan(): FixedDocumentRenderPlan {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected A4.");
  const theme = getPdfTheme("neutral");
  const fixedDate = new Date("2026-01-15T12:00:00.000Z");
  return {
    format,
    printProfile: { kind: "screen" },
    document: (
      <Document
        title="Vector graph components"
        creationDate={fixedDate}
        modificationDate={fixedDate}
        language="en-GB"
      >
        <DocumentFrame format={format} theme={theme} margin={36}>
          <Stack gap="lg">
            <Heading level={1}>Vector graphs</Heading>
            <Text>
              One dataset. Six PDF-native forms. Labels remain selectable.
            </Text>
            {[0, 2, 4].map((offset) => (
              <Row key={offset} gap="lg">
                {nominal.slice(offset, offset + 2).map(([type, title]) => (
                  <Graph
                    key={type}
                    type={type}
                    title={title}
                    seriesLabel="Copies printed"
                    data={monthlyCopies}
                  />
                ))}
              </Row>
            ))}
          </Stack>
        </DocumentFrame>
        <DocumentFrame format={format} theme={theme} margin={36}>
          <Stack gap="lg">
            <Heading level={1}>Graph boundary cases</Heading>
            <Text>
              Empty and zero states are explicit. Negative values retain a zero
              baseline.
            </Text>
            <Row gap="lg">
              <Graph
                type="line"
                title="Empty series"
                seriesLabel="No observations"
                data={[]}
              />
              <Graph
                type="bar"
                title="All-zero bars"
                seriesLabel="Copies printed"
                data={[
                  { label: "Jan", value: 0 },
                  { label: "Feb", value: 0 },
                ]}
              />
            </Row>
            <Row gap="lg">
              <Graph
                type="area"
                title="Signed values"
                seriesLabel="Change in copies"
                data={[
                  { label: "Jan", value: -10 },
                  { label: "Feb", value: 20 },
                  { label: "Mar", value: -20 },
                  { label: "Apr", value: 30 },
                ]}
              />
              <Graph
                type="pie"
                title="Zero total"
                seriesLabel="Category shares"
                data={[
                  { label: "Print", value: 0 },
                  { label: "Digital", value: 0 },
                ]}
              />
            </Row>
            <Row gap="lg">
              <Graph
                type="pie"
                title="Single pie"
                seriesLabel="Category shares"
                data={[
                  { label: "Print", value: 8 },
                  { label: "Digital", value: 0 },
                ]}
              />
              <Graph
                type="donut"
                title="Single donut"
                seriesLabel="Category shares"
                data={[{ label: "Print", value: 8 }]}
              />
            </Row>
          </Stack>
        </DocumentFrame>
      </Document>
    ),
  };
}
