import { Document, Path, Svg } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { createSafeFrame } from "../../primitives/measurement";
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

export interface PhotoHeaderInvoiceProps {
  landscapeSource: string;
  style?: TemplateStyleOverrides<typeof photoHeaderInvoiceStyle.slots>;
}
const resolved = resolveFormat("a4");
if (resolved.kind !== "fixed") throw new Error("Invoice requires A4.");
const format = resolved;
const safeFrame = createSafeFrame(format);
export const photoHeaderInvoiceStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#111111",
      border: "#d9d9d9",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#0b0b0b",
      mutedText: "#777777",
    },
    fonts: {
      body: "Noto Sans",
      heading: "Noto Sans",
      regularWeight: 400,
      strongWeight: 700,
    },
    typeScale: {
      caption: 6.5,
      body: 8.5,
      label: 9.5,
      heading: 18,
      display: 32,
    },
  },
  { rule: "#d9d9d9" },
);
const Address = ({
  label,
  children,
}: {
  label: string;
  children: readonly string[];
}) => (
  <Stack gap="xs" style={{ width: "31%" }}>
    <Text tone="muted" size="caption">
      {label}
    </Text>
    {children.map((line, index) => (
      <Text
        key={`${line}-${index}`}
        weight={index === 0 ? "strong" : "regular"}
      >
        {line}
      </Text>
    ))}
  </Stack>
);
export function PhotoHeaderInvoice(props: PhotoHeaderInvoiceProps) {
  const style = resolveTemplateStyle(photoHeaderInvoiceStyle, props.style);
  return (
    <Document title="Invoice RNY-0026" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="lg">
          <Image
            alt="Original mountain landscape"
            resolvedSource={props.landscapeSource}
            width={safeFrame.width}
            height={112}
            fit="cover"
            borderRadius={7}
          />
          <Stack gap="lg" style={{ paddingHorizontal: 10 }}>
            <Row justify="between" align="center">
              <Row align="center" gap="sm">
                <Svg width={18} height={18} viewBox="0 0 18 18">
                  <Path d="M2 2 H16 V16 H2 Z" fill="#111111" />
                  <Path
                    d="M6 5 H10.5 C13.5 5 14 9 11.2 10 L14 14 H10.8 L8.5 10.8 H8.2 V14 H6 Z M8.2 7 V9 H10.2 C11.5 9 11.5 7 10.2 7 Z"
                    fill="#ffffff"
                  />
                </Svg>
                <Text weight="strong" style={{ letterSpacing: 1.1 }}>
                  RIVEN
                </Text>
              </Row>
              <Text weight="strong">RNY-0026</Text>
            </Row>
            <Text weight="strong" style={{ fontSize: 48, letterSpacing: -1 }}>
              INVOICE
            </Text>
            <Row justify="between">
              <Address label="FROM">
                {[
                  "Solt Wagner",
                  "solt.wagner@example.com",
                  "1547 Wilson Street",
                  "San Diego, California",
                  "+1 234 5678",
                ]}
              </Address>
              <Address label="BILL TO">
                {[
                  "Ana Morales",
                  "ana@solcraft.example",
                  "22 Reform Avenue",
                  "Mexico City 06600",
                ]}
              </Address>
              <Stack gap="xs" style={{ width: "25%" }}>
                <Text align="right" tone="muted" size="caption">
                  ISSUED
                </Text>
                <Text align="right">April 1, 2026</Text>
                <Text
                  align="right"
                  tone="muted"
                  size="caption"
                  style={{ marginTop: 8 }}
                >
                  DUE
                </Text>
                <Text align="right">May 1, 2026</Text>
              </Stack>
            </Row>
            <Stack gap="xs" style={{ marginTop: 20 }}>
              <Row
                style={{
                  borderBottomColor: style.slots.rule,
                  borderBottomWidth: 0.6,
                  paddingBottom: 7,
                }}
              >
                <Text tone="muted" size="caption" style={{ width: "60%" }}>
                  DESCRIPTION
                </Text>
                <Text tone="muted" size="caption" style={{ width: "12%" }}>
                  QTY
                </Text>
                <Text
                  align="right"
                  tone="muted"
                  size="caption"
                  style={{ width: "14%" }}
                >
                  RATE
                </Text>
                <Text
                  align="right"
                  tone="muted"
                  size="caption"
                  style={{ width: "14%" }}
                >
                  AMOUNT
                </Text>
              </Row>
              <Row
                style={{
                  borderBottomColor: style.slots.rule,
                  borderBottomWidth: 0.6,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ width: "60%" }}>Design direction</Text>
                <Text style={{ width: "12%" }}>1</Text>
                <Text align="right" style={{ width: "14%" }}>
                  $500.00
                </Text>
                <Text align="right" weight="strong" style={{ width: "14%" }}>
                  $500.00
                </Text>
              </Row>
            </Stack>
            <Row justify="end">
              <Stack gap="sm" style={{ width: 175 }}>
                <Row justify="between">
                  <Text tone="muted">Subtotal</Text>
                  <Text>$500.00</Text>
                </Row>
                <Row justify="between">
                  <Text tone="muted">Tax (15%)</Text>
                  <Text>$75.00</Text>
                </Row>
                <Row
                  justify="between"
                  style={{
                    borderTopColor: style.slots.rule,
                    borderTopWidth: 0.6,
                    paddingTop: 8,
                  }}
                >
                  <Text weight="strong">Total</Text>
                  <Text weight="strong">$575.00</Text>
                </Row>
              </Stack>
            </Row>
            <Stack gap="xs" style={{ marginTop: 24 }}>
              <Text tone="muted" size="caption">
                PAYMENT DETAILS
              </Text>
              <Text>Payment method: Bank transfer</Text>
              <Text>Bank: Northline Bank · Account: 1234 5678 9877 1235</Text>
              <Text>Routing/SWIFT: EU12355</Text>
              <Text tone="muted" size="caption" style={{ marginTop: 12 }}>
                NOTES
              </Text>
              <Text>Thank you for your business!</Text>
            </Stack>
          </Stack>
        </Stack>
      </PageFrame>
    </Document>
  );
}
export const photoHeaderInvoiceDefinition: TemplateDefinition = {
  id: "invoice-photo-header",
  slug: "invoice-photo-header",
  title: "Photo header invoice",
  family: "invoice",
  familyLabel: "Invoices",
  description:
    "A minimalist invoice with a wide original landscape, oversized title and precise billing summary.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["invoice", "photo", "minimal", "service"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: ({ invoiceLandscapeSource }: TemplateSampleAssets) => (
    <PhotoHeaderInvoice landscapeSource={invoiceLandscapeSource} />
  ),
};
