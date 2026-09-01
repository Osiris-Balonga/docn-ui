import { Circle, Document, G, Line, Path, Svg } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Graph } from "../../primitives/graph";
import { GraphText } from "../../primitives/graph-text";
import { Heading } from "../../primitives/heading";
import { Image } from "../../primitives/image";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition, TemplateSampleAssets } from "../types";

export interface CustomerSupportReportProps {
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof customerSupportReportStyle.slots>;
}
const resolved = resolveFormat("a4");
if (resolved.kind !== "fixed") throw new Error("Report requires A4.");
const format = resolved;
export const customerSupportReportStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#123fe8",
      border: "#d8dde9",
      canvas: "#f4f6fa",
      surface: "#ffffff",
      text: "#111827",
      mutedText: "#6b7280",
    },
    typeScale: { caption: 5.5, body: 8, label: 9, heading: 17, display: 25 },
  },
  { quote: "#ffffff" },
);
const Quote = ({ children }: { children: string }) => (
  <Stack
    gap="xs"
    style={{
      backgroundColor: "#ffffff",
      borderBottomColor: "#123fe8",
      borderBottomWidth: 1.5,
      borderRadius: 14,
      padding: 10,
    }}
  >
    <Text align="center" style={{ color: "#123fe8" }}>
      {children}
    </Text>
  </Stack>
);
function RoundedDonut({
  title,
  values,
}: {
  title: string;
  values: readonly { color: string; value: number }[];
}) {
  const radius = 43;
  const segments = values.map((item, index) => {
    const consumedBefore = values
      .slice(0, index)
      .reduce((total, value) => total + value.value, 0);
    const consumedAfter = consumedBefore + item.value;
    return {
      end: -Math.PI / 2 + (consumedAfter / 100) * Math.PI * 2,
      index,
      item,
      start: -Math.PI / 2 + (consumedBefore / 100) * Math.PI * 2,
    };
  });
  return (
    <Stack gap="xs" style={{ width: 235 }}>
      <Text weight="strong">{title}</Text>
      <Svg width={210} height={150} viewBox="0 0 210 150">
        {segments.map(({ end, index, item, start }) => {
          const inset = 0.035;
          const from = {
            x: 78 + radius * Math.cos(start + inset),
            y: 75 + radius * Math.sin(start + inset),
          };
          const to = {
            x: 78 + radius * Math.cos(end - inset),
            y: 75 + radius * Math.sin(end - inset),
          };
          const largeArc = end - start > Math.PI ? 1 : 0;
          return (
            <Path
              key={`${item.value}-${index}`}
              d={`M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`}
              fill="none"
              stroke={item.color}
              strokeWidth={14}
              strokeLinecap="round"
            />
          );
        })}
        {values.map((item, index) => (
          <G key={`legend-${index}`}>
            <Circle cx={145} cy={50 + index * 18} r={3.5} fill={item.color} />
            <GraphText x={154} y={53 + index * 18} fill="#4b5563">
              {`${item.value}%`}
            </GraphText>
          </G>
        ))}
      </Svg>
    </Stack>
  );
}
export function CustomerSupportReport(props: CustomerSupportReportProps) {
  const style = resolveTemplateStyle(customerSupportReportStyle, props.style);
  return (
    <Document title="Customer support report" language="en">
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.canvas}
      >
        <Svg
          width={540}
          height={760}
          style={{ left: 0, position: "absolute", top: 0 }}
        >
          {Array.from({ length: 13 }, (_, index) => (
            <Line
              key={`v-${index}`}
              x1={index * 45}
              x2={index * 45}
              y1={0}
              y2={760}
              stroke="#e1e5ed"
              strokeWidth={0.45}
            />
          ))}
          {Array.from({ length: 18 }, (_, index) => (
            <Line
              key={`h-${index}`}
              x1={0}
              x2={540}
              y1={index * 45}
              y2={index * 45}
              stroke="#e1e5ed"
              strokeWidth={0.45}
            />
          ))}
        </Svg>
        <Stack gap="lg" style={{ padding: 8 }}>
          <Stack gap="sm">
            <Heading level="display" style={{ fontSize: 21 }}>
              Customer support
            </Heading>
            <Text>How do customers rate the support experience?</Text>
            <Text tone="muted">
              Most responses are positive, with clear room to differentiate
              through faster resolution.
            </Text>
            <Text style={{ color: style.theme.colors.accent, fontSize: 17 }}>
              a stronger service edge
            </Text>
          </Stack>
          <Row gap="md">
            <Graph
              title="Rating"
              seriesLabel="Share"
              type="bar"
              width={245}
              height={245}
              barRadius={11}
              colors={["#e4e7ed", "#d9dde5", "#123fe8", "#123fe8"]}
              showGridLines={false}
              showLegend={false}
              data={[
                { label: "L", value: 4 },
                { label: "M", value: 24 },
                { label: "G", value: 48 },
                { label: "T", value: 24 },
              ]}
            />
            <Stack gap="lg" style={{ width: 245, paddingTop: 14 }}>
              <Stack gap="xs">
                <Text>Preferred support channel</Text>
                <Row align="end" gap="sm">
                  <Text style={{ fontSize: 27 }}>76.2%</Text>
                  <Text style={{ color: style.theme.colors.accent }}>
                    use in-app support
                  </Text>
                </Row>
              </Stack>
              <Stack gap="xs">
                <Text>Satisfactory resolution rate</Text>
                <Row align="end" gap="sm">
                  <Text style={{ fontSize: 27 }}>61.9%</Text>
                  <Text style={{ color: style.theme.colors.accent }}>
                    say it happens often
                  </Text>
                </Row>
              </Stack>
            </Stack>
          </Row>
          <Row gap="md">
            <RoundedDonut
              title="Response time"
              values={[
                { color: "#123fe8", value: 38.1 },
                { color: "#cfd4dd", value: 33.3 },
                { color: "#e6e8ed", value: 28.6 },
              ]}
            />
            <Graph
              title="Helpfulness"
              seriesLabel="Share"
              type="bar"
              width={245}
              height={220}
              barRadius={11}
              colors={["#d9dde5", "#cfd4dd", "#123fe8"]}
              showGridLines={false}
              showLegend={false}
              data={[
                { label: "L", value: 19 },
                { label: "A", value: 28.6 },
                { label: "H", value: 52.4 },
              ]}
            />
          </Row>
          <Row gap="lg" align="center">
            <RoundedDonut
              title="Peer comparison"
              values={[
                { color: "#123fe8", value: 61.9 },
                { color: "#d7dbe3", value: 19 },
                { color: "#eef0f4", value: 14.3 },
                { color: "#2b2b2b", value: 4.8 },
              ]}
            />
            <Stack gap="sm" style={{ width: 255 }}>
              <Text style={{ color: style.theme.colors.accent, fontSize: 16 }}>
                What customers are saying...
              </Text>
              <Quote>“The in-app chat is the fastest way to get help.”</Quote>
              <Quote>
                “Clearer status updates would make the experience better.”
              </Quote>
              <Row align="center" gap="md">
                <Quote>“The team is friendly and practical.”</Quote>
                <Image
                  alt="Fictional customer portrait"
                  resolvedSource={props.portraitSource}
                  width={74}
                  height={74}
                  fit="cover"
                  borderRadius={37}
                />
              </Row>
            </Stack>
          </Row>
        </Stack>
      </PageFrame>
    </Document>
  );
}
export const customerSupportReportDefinition: TemplateDefinition = {
  id: "report-customer-support",
  slug: "report-customer-support",
  title: "Customer support report",
  family: "report",
  familyLabel: "Reports",
  description:
    "A research-style service report combining rating charts, key findings and customer quotes.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["report", "research", "support", "survey"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: ({ supportPortraitSource }: TemplateSampleAssets) => (
    <CustomerSupportReport portraitSource={supportPortraitSource} />
  ),
};
