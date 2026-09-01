import { Document, Rect, Svg } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Graph } from "../../primitives/graph";
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
            <Svg width={22} height={16}>
              <Rect
                x={1}
                y={4}
                width={20}
                height={8}
                rx={4}
                fill={style.theme.colors.accent}
              />
              <Rect x={9} y={4} width={4} height={8} fill="#ffffff" />
            </Svg>
            <Text weight="strong" style={{ fontSize: 17 }}>
              MARKET LENS
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
          <Graph
            title="Annual revenue"
            seriesLabel="USD bn"
            type="bar"
            width={420}
            height={420}
            data={[
              { label: "21", value: 123 },
              { label: "22", value: 141 },
              { label: "23", value: 156 },
            ]}
          />
          <Text
            style={{ fontSize: 18, lineHeight: 1.45, marginHorizontal: 36 }}
          >
            In 2023, the two marketplace channels are expected to generate
            around $156 billion in combined revenue.
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
