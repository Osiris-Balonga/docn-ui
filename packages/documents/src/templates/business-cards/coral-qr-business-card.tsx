import { Document, Line, Path, Svg } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { PageFrame } from "../../primitives/page-frame";
import { QRCode } from "../../primitives/qr-code-view";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition } from "../types";

export interface CoralQrBusinessCardProps {
  style?: TemplateStyleOverrides<typeof coralQrBusinessCardStyle.slots>;
}
const resolved = resolveFormat("card-90x50");
if (resolved.kind !== "fixed") throw new Error("Card requires fixed format.");
const format = resolved;
export const coralQrBusinessCardStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#ed4f3c",
      border: "#272727",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#252525",
      mutedText: "#6f6f6f",
    },
    typeScale: {
      caption: 5.2,
      body: 6.4,
      label: 7.2,
      heading: 11,
      display: 16,
    },
  },
  { reverse: "#ed4f3c" },
);
const Mark = ({ color }: { color: string }) => (
  <Svg width={22} height={17} viewBox="0 0 22 17">
    <Path
      d="M1 3 C7 1 9 5 12 8 C9 9 7 10 5 14 C4 9 3 7 1 3 Z M10 1 C16 0 19 4 21 8 C17 8 14 10 12 15 C11 9 9 6 10 1 Z"
      fill={color}
    />
  </Svg>
);
const ContactIcon = ({ type }: { type: "mail" | "phone" | "pin" }) => (
  <Svg width={8} height={8} viewBox="0 0 12 12">
    {type === "phone" ? (
      <Path
        d="M3 1.5 L4.5 4 L3.7 5.1 C4.5 6.7 5.6 7.8 7.2 8.5 L8.3 7.7 L10.5 9.2 C9.8 10.7 8.8 11 7.7 10.7 C4.4 9.7 2.3 7.5 1.3 4.2 C1 3.1 1.5 2.1 3 1.5 Z"
        fill="#ed4f3c"
      />
    ) : type === "mail" ? (
      <Path
        d="M1 2.5 H11 V9.5 H1 Z M1.5 3 L6 6.3 L10.5 3"
        fill="none"
        stroke="#ed4f3c"
        strokeWidth={1.2}
      />
    ) : (
      <Path
        d="M6 1.2 C3.7 1.2 2.3 2.8 2.3 4.8 C2.3 7.3 6 10.8 6 10.8 C6 10.8 9.7 7.3 9.7 4.8 C9.7 2.8 8.3 1.2 6 1.2 Z M6 3.5 A1.3 1.3 0 1 0 6 6.1 A1.3 1.3 0 1 0 6 3.5"
        fill="#ed4f3c"
      />
    )}
  </Svg>
);
export function CoralQrBusinessCard(props: CoralQrBusinessCardProps) {
  const style = resolveTemplateStyle(coralQrBusinessCardStyle, props.style);
  return (
    <Document title="Coral QR business card" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="sm" style={{ padding: 5 }}>
          <Row justify="between" align="start">
            <Row gap="sm" align="center">
              <Mark color={style.theme.colors.accent} />
              <Text weight="strong" style={{ fontSize: 9 }}>
                REDWOOD
              </Text>
            </Row>
            <QRCode
              payload="https://redwood.example/contact/razib"
              size={48}
              minimumModuleSize={0.8}
            />
          </Row>
          <Row align="end" style={{ marginTop: 7 }}>
            <Text weight="strong" style={{ fontSize: 10, width: "58%" }}>
              RAZIB{" "}
              <Text style={{ color: style.theme.colors.accent }}>
                P. FERGUSON
              </Text>
            </Text>
            <Text align="right" tone="muted" style={{ width: "42%" }}>
              SALES MANAGER
            </Text>
          </Row>
          <Svg width={220} height={2} viewBox="0 0 220 2">
            <Line
              x1={0}
              x2={220}
              y1={1}
              y2={1}
              stroke="#8a8a8a"
              strokeWidth={0.6}
            />
          </Svg>
          <Row justify="between" align="start">
            <Stack gap="xs" style={{ width: "52%" }}>
              <Row align="center" gap="xs">
                <ContactIcon type="phone" />
                <Text>00-9659-65258869</Text>
              </Row>
              <Row align="center" gap="xs">
                <ContactIcon type="mail" />
                <Text>hello@redwood.example</Text>
              </Row>
            </Stack>
            <Row align="center" gap="xs" style={{ width: "40%" }}>
              <ContactIcon type="pin" />
              <Stack gap="xs">
                <Text>28/7 Cedar Avenue</Text>
                <Text>Dhaka 1205</Text>
              </Stack>
            </Row>
          </Row>
        </Stack>
      </PageFrame>
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.slots.reverse}
      >
        <Row justify="center" align="center" style={{ height: "100%" }}>
          <Mark color="#ffffff" />
          <Text weight="strong" style={{ color: "#ffffff", fontSize: 15 }}>
            REDWOOD
          </Text>
        </Row>
      </PageFrame>
    </Document>
  );
}
export const coralQrBusinessCardDefinition: TemplateDefinition = {
  id: "business-card-coral-qr",
  slug: "business-card-coral-qr",
  title: "Coral QR business card",
  family: "business-card",
  familyLabel: "Business Cards",
  description:
    "A two-sided coral and white contact card with a scannable QR code and reverse brand field.",
  supportedFormatIds: ["card-90x50"],
  supportedThemeIds: ["neutral"],
  tags: ["business-card", "two-sided", "qr", "coral"],
  version: "1.0.0",
  sides: 2,
  capabilities: { logo: false, printProfiles: true, qr: true },
  renderSample: () => <CoralQrBusinessCard />,
};
