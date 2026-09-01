import { Document, Path, Svg } from "@react-pdf/renderer";
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
export function CoralQrBusinessCard(props: CoralQrBusinessCardProps) {
  const style = resolveTemplateStyle(coralQrBusinessCardStyle, props.style);
  return (
    <Document title="Coral QR business card" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="lg" style={{ padding: 6 }}>
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
          <Row justify="between" align="end">
            <Stack gap="xs">
              <Row gap="xs">
                <Text weight="strong" style={{ fontSize: 10 }}>
                  RAZIB P. FERGUSON
                </Text>
                <Text tone="muted">SALES MANAGER</Text>
              </Row>
              <Text style={{ color: style.theme.colors.accent }}>
                +00 9659 652 58869
              </Text>
              <Text>hello@redwood.example</Text>
            </Stack>
            <Stack gap="xs">
              <Text align="right">28/7 Cedar Avenue</Text>
              <Text align="right">Dhaka 1205</Text>
            </Stack>
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
