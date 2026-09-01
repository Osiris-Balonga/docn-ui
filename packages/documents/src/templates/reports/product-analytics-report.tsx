import {
  Circle,
  Document,
  G,
  Line,
  Path,
  Rect,
  Svg,
} from "@react-pdf/renderer";
import { GraphText } from "../../primitives/graph-text";
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
const acquisitionSeries = [
  {
    color: "#21a9ea",
    label: "organic",
    values: [
      42, 48, 41, 62, 63, 49, 61, 48, 71, 71, 71, 65, 78, 71, 71, 71, 78, 71,
      69, 56, 56, 56, 71, 71, 78, 86, 99, 86, 99, 99,
    ],
  },
  {
    color: "#49d2a3",
    label: "direct",
    values: [
      39, 42, 40, 47, 47, 42, 47, 43, 50, 50, 50, 47, 52, 49, 49, 49, 52, 49,
      49, 45, 45, 45, 50, 50, 50, 52, 55, 59, 55, 59,
    ],
  },
  {
    color: "#f45b2a",
    label: "paid",
    values: [
      8, 11, 8, 14, 14, 10, 15, 10, 18, 18, 18, 14, 20, 16, 16, 16, 20, 16, 16,
      12, 12, 12, 18, 18, 18, 20, 23, 28, 23, 28,
    ],
  },
  {
    color: "#e85fd2",
    label: "social",
    values: [
      42, 39, 41, 34, 34, 39, 34, 39, 31, 31, 31, 35, 29, 33, 33, 33, 29, 32,
      32, 32, 39, 37, 31, 31, 31, 28, 24, 20, 25, 20,
    ],
  },
  {
    color: "#f5b72f",
    label: "referral",
    values: [
      48, 45, 18, 14, 12, 17, 12, 17, 8, 38, 38, 41, 36, 40, 40, 40, 37, 30, 30,
      35, 23, 27, 27, 27, 37, 55, 52, 83, 78, 78,
    ],
  },
  {
    color: "#9a55dc",
    label: "email",
    values: [
      40, 43, 40, 60, 60, 48, 60, 48, 68, 68, 68, 60, 76, 68, 68, 68, 76, 67,
      67, 67, 56, 56, 53, 62, 53, 60, 59, 55, 51, 47,
    ],
  },
] as const;

function AcquisitionChart() {
  const width = 500;
  const height = 330;
  const plot = { x: 42, y: 34, width: 440, height: 220 };
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <GraphText x={4} y={13} size="label" strong>
        Users by Source / Medium
      </GraphText>
      {[0, 50, 100].map((tick) => {
        const y = plot.y + plot.height - (tick / 100) * plot.height;
        return (
          <G key={tick}>
            <Line
              x1={plot.x}
              x2={plot.x + plot.width}
              y1={y}
              y2={y}
              stroke="#d9dde3"
              strokeWidth={0.7}
            />
            <GraphText
              x={plot.x - 10}
              y={y + 2}
              textAnchor="end"
              fill="#68707c"
            >
              {`${tick}K`}
            </GraphText>
          </G>
        );
      })}
      {[0, 7, 14, 21, 28].map((index) => {
        const x = plot.x + (index / 29) * plot.width;
        return (
          <G key={index}>
            <Line
              x1={x}
              x2={x}
              y1={plot.y}
              y2={plot.y + plot.height}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
            <GraphText
              x={x}
              y={plot.y + plot.height + 17}
              textAnchor="middle"
              fill="#68707c"
            >
              {`May ${index + 1}`}
            </GraphText>
          </G>
        );
      })}
      {acquisitionSeries.map((item) => {
        const d = item.values
          .map(
            (value, index) =>
              `${index ? "L" : "M"} ${plot.x + (index / (item.values.length - 1)) * plot.width} ${plot.y + plot.height - (value / 100) * plot.height}`,
          )
          .join(" ");
        return (
          <Path
            key={item.label}
            d={d}
            fill="none"
            stroke={item.color}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      {acquisitionSeries.map((item, index) => {
        const x = 8 + index * 79;
        return (
          <G key={item.label}>
            <Circle cx={x} cy={302} r={3.3} fill={item.color} />
            <GraphText x={x + 7} y={305} fill="#4b5563">
              {item.label}
            </GraphText>
          </G>
        );
      })}
    </Svg>
  );
}
export function ProductAnalyticsReport(props: ProductAnalyticsReportProps) {
  const style = resolveTemplateStyle(productAnalyticsReportStyle, props.style);
  return (
    <Document title="Product analytics report" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="xl" style={{ padding: 12 }}>
          <Row align="center" gap="sm">
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path d="M2 13 L5 3 L8 6 L11 2 L14 13 Z" fill="#f5b72f" />
              <Rect x={7} y={7} width={3} height={7} rx={1} fill="#ffcf45" />
            </Svg>
            <Heading level={1}>Northstar Analytics Report</Heading>
          </Row>
          <Row style={{ flexWrap: "wrap", rowGap: 30 }}>
            {metrics.map(([label, value, change, positive]) => (
              <Stack key={label} gap="sm" style={{ width: "33.333%" }}>
                <Text weight="strong" style={{ fontSize: 12 }}>
                  {label}
                </Text>
                <Row gap="sm" align="center">
                  <Text
                    weight="strong"
                    style={{ color: style.theme.colors.accent, fontSize: 20 }}
                  >
                    {value}
                  </Text>
                  <Row gap="xs" align="center">
                    <Svg width={7} height={8} viewBox="0 0 7 8">
                      <Path
                        d={
                          positive
                            ? "M3.5 0 L7 4 H5 V8 H2 V4 H0 Z"
                            : "M0 4 H2 V0 H5 V4 H7 L3.5 8 Z"
                        }
                        fill={
                          positive ? style.slots.positive : style.slots.negative
                        }
                      />
                    </Svg>
                    <Text
                      style={{
                        color: positive
                          ? style.slots.positive
                          : style.slots.negative,
                      }}
                    >
                      {change.replace(/[+-]/, "")}
                    </Text>
                  </Row>
                </Row>
              </Stack>
            ))}
          </Row>
          <AcquisitionChart />
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
