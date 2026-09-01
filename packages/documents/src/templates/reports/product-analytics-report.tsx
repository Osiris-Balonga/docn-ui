import { Document, Rect, Svg } from "@react-pdf/renderer";
import { Graph } from "../../primitives/graph";
import { Heading } from "../../primitives/heading";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { resolveFormat } from "../../core/formats";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition } from "../types";

export interface ProductAnalyticsReportProps {
  style?: TemplateStyleOverrides<typeof productAnalyticsReportStyle.slots>;
}
const resolved = resolveFormat("a4");
if (resolved.kind !== "fixed") throw new Error("Report requires A4.");
const format = resolved;
export const productAnalyticsReportStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#1597e5",
      border: "#d9dde3",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#151922",
      mutedText: "#68707c",
    },
    typeScale: { caption: 7, body: 9, label: 10, heading: 18, display: 28 },
  },
  { positive: "#17835d", negative: "#c5285b" },
);
const metrics = [
  ["Sessions", "600.8K", "-0.51%", false],
  ["Total users", "403.13K", "+6.5%", true],
  ["New users", "212.9K", "-7.4%", false],
  ["Key events", "79.33K", "-2.9%", false],
  ["Key event rate", "18.69%", "+16.7%", true],
  ["Bounce rate", "29.82%", "+4.3%", false],
] as const;
export function ProductAnalyticsReport(props: ProductAnalyticsReportProps) {
  const style = resolveTemplateStyle(productAnalyticsReportStyle, props.style);
  return (
    <Document title="Product analytics report" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="xl" style={{ padding: 12 }}>
          <Row align="center" gap="sm">
            <Svg width={13} height={13}>
              <Rect
                x={1}
                y={1}
                width={11}
                height={11}
                rx={2}
                fill={style.theme.colors.accent}
              />
            </Svg>
            <Heading level={1}>Product Analytics Report</Heading>
          </Row>
          <Row style={{ flexWrap: "wrap", rowGap: 30 }}>
            {metrics.map(([label, value, change, positive]) => (
              <Stack key={label} gap="sm" style={{ width: "33.333%" }}>
                <Text weight="strong" style={{ fontSize: 12 }}>
                  {label}
                </Text>
                <Row gap="sm" align="end">
                  <Text
                    weight="strong"
                    style={{ color: style.theme.colors.accent, fontSize: 20 }}
                  >
                    {value}
                  </Text>
                  <Text
                    style={{
                      color: positive
                        ? style.slots.positive
                        : style.slots.negative,
                    }}
                  >
                    {change}
                  </Text>
                </Row>
              </Stack>
            ))}
          </Row>
          <Graph
            title="Users by acquisition channel"
            seriesLabel="Active users · thousands"
            type="line"
            width={500}
            height={350}
            data={[
              { label: "May 1", value: 42 },
              { label: "May 7", value: 61 },
              { label: "May 13", value: 76 },
              { label: "May 19", value: 71 },
              { label: "May 25", value: 56 },
              { label: "May 31", value: 98 },
            ]}
          />
          <Text tone="muted" size="caption">
            Original sample data · Northline product team · May 2026
          </Text>
        </Stack>
      </PageFrame>
    </Document>
  );
}
export const productAnalyticsReportDefinition: TemplateDefinition = {
  id: "report-product-analytics",
  slug: "report-product-analytics",
  title: "Product analytics report",
  family: "report",
  familyLabel: "Reports",
  description:
    "A KPI-led analytics report with six metrics and a full-width acquisition trend chart.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["report", "analytics", "kpi", "chart"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => <ProductAnalyticsReport />,
};
