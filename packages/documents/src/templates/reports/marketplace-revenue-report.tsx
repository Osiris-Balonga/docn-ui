import { Document, G, Line, Path, Rect, Svg } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { GraphText } from "../../primitives/graph-text";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition } from "../types";

export interface MarketplaceRevenueReportProps {
  style?: TemplateStyleOverrides<typeof marketplaceRevenueReportStyle.slots>;
}
const resolved = resolveFormat("a4");
if (resolved.kind !== "fixed") throw new Error("Report requires A4.");
const format = resolved;
export const marketplaceRevenueReportStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#ff7a2f",
      border: "#e1e1e1",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#171717",
      mutedText: "#676767",
    },
    typeScale: { caption: 7, body: 10, label: 11, heading: 20, display: 30 },
  },
  { secondary: "#ffc42d" },
);
const series = [
  { color: "#ffc42d", label: "Open marketplace", values: [45, 53, 60] },
  { color: "#ff6f3d", label: "Curated marketplace", values: [78, 88, 96] },
] as const;

function RevenueChart() {
  const width = 420;
  const height = 390;
  const plot = { x: 54, y: 24, width: 330, height: 285 };
  const years = ["2021", "2022", "2023"];
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = plot.y + plot.height - (tick / 100) * plot.height;
        return (
          <G key={tick}>
            <Line
              x1={plot.x}
              x2={plot.x + plot.width}
              y1={y}
              y2={y}
              stroke="#dedede"
              strokeWidth={0.7}
            />
            <GraphText
              x={plot.x - 10}
              y={y + 2}
              textAnchor="end"
              fill="#555555"
            >
              {`$${tick}B`}
            </GraphText>
          </G>
        );
      })}
      {years.map((year, yearIndex) => {
        const groupX = plot.x + 35 + yearIndex * 108;
        return (
          <G key={year}>
            {series.map((item, seriesIndex) => {
              const value = item.values[yearIndex]!;
              const barHeight = (value / 100) * plot.height;
              return (
                <Rect
                  key={item.label}
                  x={groupX + seriesIndex * 30}
                  y={plot.y + plot.height - barHeight}
                  width={27}
                  height={barHeight}
                  rx={5}
                  ry={5}
                  fill={item.color}
                />
              );
            })}
            <GraphText
              x={groupX + 28}
              y={plot.y + plot.height + 18}
              textAnchor="middle"
            >
              {year}
            </GraphText>
          </G>
        );
      })}
    </Svg>
  );
}
export function MarketplaceRevenueReport(props: MarketplaceRevenueReportProps) {
  const style = resolveTemplateStyle(
    marketplaceRevenueReportStyle,
    props.style,
  );
  return (
    <Document title="Marketplace revenue report" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="xl" style={{ padding: 12 }}>
          <Row align="center" gap="sm">
            <Svg width={26} height={18} viewBox="0 0 26 18">
              <Path
                d="M2 14 C5 3 15 1 24 10"
                fill="none"
                stroke="#ff9f1a"
                strokeWidth={4}
                strokeLinecap="round"
              />
            </Svg>
            <Text weight="strong" style={{ fontSize: 17 }}>
              MARGIN
            </Text>
          </Row>
          <Row justify="center" gap="lg">
            <Row gap="sm" align="center">
              <Svg width={10} height={10}>
                <Rect width={10} height={10} fill={style.slots.secondary} />
              </Svg>
              <Text>Open marketplace</Text>
            </Row>
            <Row gap="sm" align="center">
              <Svg width={10} height={10}>
                <Rect width={10} height={10} fill={style.theme.colors.accent} />
              </Svg>
              <Text>Curated marketplace</Text>
            </Row>
          </Row>
          <RevenueChart />
          <Text
            style={{ fontSize: 18, lineHeight: 1.45, marginHorizontal: 36 }}
          >
            In 2023, the two marketplace channels are expected to generate
            around $60 billion and $96 billion respectively.
          </Text>
          <Text tone="muted" size="caption" style={{ marginHorizontal: 36 }}>
            Illustrative figures for layout demonstration only.
          </Text>
        </Stack>
      </PageFrame>
    </Document>
  );
}
export const marketplaceRevenueReportDefinition: TemplateDefinition = {
  id: "report-marketplace-revenue",
  slug: "report-marketplace-revenue",
  title: "Marketplace revenue report",
  family: "report",
  familyLabel: "Reports",
  description:
    "A concise annual revenue report with a centered chart, legend and explanatory conclusion.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["report", "marketplace", "revenue", "bar-chart"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => <MarketplaceRevenueReport />,
};
