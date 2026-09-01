import { Document } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Graph } from "../../primitives/graph";
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
export function CustomerSupportReport(props: CustomerSupportReportProps) {
  const style = resolveTemplateStyle(customerSupportReportStyle, props.style);
  return (
    <Document title="Customer support report" language="en">
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.canvas}
      >
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
            <Graph
              title="Response"
              seriesLabel="Share"
              type="donut"
              width={245}
              height={220}
              data={[
                { label: "F", value: 38.1 },
                { label: "A", value: 33.3 },
                { label: "S", value: 28.6 },
              ]}
            />
            <Graph
              title="Helpfulness"
              seriesLabel="Share"
              type="bar"
              width={245}
              height={220}
              data={[
                { label: "L", value: 19 },
                { label: "A", value: 28.6 },
                { label: "H", value: 52.4 },
              ]}
            />
          </Row>
          <Row gap="lg" align="center">
            <Graph
              title="Peer comparison"
              seriesLabel="Share"
              type="donut"
              width={235}
              height={220}
              data={[
                { label: "B", value: 61.9 },
                { label: "E", value: 19 },
                { label: "U", value: 14.3 },
                { label: "W", value: 4.8 },
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
