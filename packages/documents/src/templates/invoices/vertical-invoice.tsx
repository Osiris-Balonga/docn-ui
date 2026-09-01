import { Document, View } from "@react-pdf/renderer";
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

export interface VerticalInvoiceProps {
  billedTo: readonly string[];
  contactEmail: string;
  invoiceDate: string;
  invoiceNumber: string;
  items: readonly { description: string; subtotal: string }[];
  paymentAccount: string;
  paymentName: string;
  payUrl: string;
  sellerName: string;
  style?: TemplateStyleOverrides<typeof verticalInvoiceStyle.slots>;
  total: string;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed") throw new Error("Invoice requires A4.");
const format = resolvedFormat;

export const verticalInvoiceStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#08275f",
      canvas: "#f4f0e7",
      surface: "#f4f0e7",
      text: "#08275f",
      mutedText: "#08275f",
    },
    typeScale: { caption: 8, body: 10, label: 11, heading: 16, display: 28 },
  },
  { secondaryAccent: "#9a713d" },
);

const pageInset = -28.35;

export function VerticalInvoice(props: VerticalInvoiceProps) {
  const style = resolveTemplateStyle(verticalInvoiceStyle, props.style);
  const { theme } = style;
  const navy = theme.colors.accent;
  const cream = theme.colors.canvas;
  const ochre = style.slots.secondaryAccent;
  return (
    <Document title={`Invoice ${props.invoiceNumber}`} language="en">
      <PageFrame format={format} theme={theme} backgroundColor={cream}>
        <View
          style={{
            height: 841.89,
            left: pageInset,
            position: "absolute",
            top: pageInset,
            width: 595.28,
          }}
        >
          <View
            style={{
              borderRightColor: navy,
              borderRightWidth: 0.75,
              bottom: 0,
              left: 0,
              position: "absolute",
              top: 0,
              width: 146,
            }}
          />
          <View
            style={{
              borderBottomColor: navy,
              borderBottomWidth: 0.75,
              left: 146,
              position: "absolute",
              right: 0,
              top: 216,
            }}
          />

          <Text
            style={{
              fontSize: 30,
              left: -78,
              letterSpacing: -1.2,
              position: "absolute",
              top: 125,
              transform: "rotate(-90deg)",
              width: 300,
            }}
          >
            {props.sellerName}
          </Text>
          <Text
            style={{
              fontSize: 59,
              left: -94,
              letterSpacing: -3,
              lineHeight: 1,
              position: "absolute",
              top: 525,
              transform: "rotate(-90deg)",
              width: 310,
            }}
          >
            invoice
          </Text>

          <Stack
            gap="lg"
            style={{ left: 397, position: "absolute", top: 64, width: 155 }}
          >
            <Stack gap="xs">
              <Text style={{ fontSize: 10.5 }}>
                Invoice No. {props.invoiceNumber}
              </Text>
              <Text style={{ fontSize: 10.5 }}>{props.invoiceDate}</Text>
            </Stack>
            <Stack gap="xs" style={{ marginTop: 21 }}>
              <Text
                style={{
                  fontSize: 10.5,
                  textDecoration: "underline",
                  textTransform: "uppercase",
                }}
              >
                Billed to
              </Text>
              {props.billedTo.map((line) => (
                <Text key={line} style={{ fontSize: 10.5 }}>
                  {line}
                </Text>
              ))}
            </Stack>
          </Stack>

          <View
            style={{ left: 195, position: "absolute", right: 59, top: 244 }}
          >
            <Row style={{ paddingBottom: 16 }}>
              <Text weight="strong" style={{ fontSize: 10.5, width: "64%" }}>
                DESCRIPTION
              </Text>
              <Text weight="strong" style={{ fontSize: 10.5, width: "36%" }}>
                SUBTOTAL
              </Text>
            </Row>
            <View style={{ borderTopColor: navy, borderTopWidth: 0.75 }} />
            <Stack gap="xl" style={{ gap: 23, paddingVertical: 18 }}>
              {props.items.map((item) => (
                <Row key={item.description}>
                  <Text style={{ fontSize: 10.5, width: "64%" }}>
                    {item.description}
                  </Text>
                  <Text style={{ fontSize: 10.5, width: "36%" }}>
                    {item.subtotal}
                  </Text>
                </Row>
              ))}
            </Stack>
            <View style={{ borderTopColor: navy, borderTopWidth: 0.75 }} />
            <Row style={{ paddingTop: 16 }}>
              <Text weight="strong" style={{ fontSize: 10.5, width: "64%" }}>
                TOTAL
              </Text>
              <Text weight="strong" style={{ fontSize: 10.5, width: "36%" }}>
                {props.total}
              </Text>
            </Row>
          </View>

          <Stack
            gap="md"
            style={{ left: 195, position: "absolute", top: 637, width: 235 }}
          >
            <Stack gap="xs">
              <Text style={{ fontSize: 10.5, textDecoration: "underline" }}>
                PAYMENTS
              </Text>
              <Text style={{ fontSize: 10.5 }}>{props.paymentName}</Text>
              <Text style={{ fontSize: 10.5 }}>{props.paymentAccount}</Text>
            </Stack>
            <Text style={{ fontSize: 10.5, marginTop: 3 }}>
              Scan the QR code to pay.
            </Text>
            <Stack gap="xs" style={{ marginTop: 2 }}>
              <Text
                style={{
                  color: ochre,
                  fontSize: 10.5,
                  textDecoration: "underline",
                }}
              >
                QUESTIONS?
              </Text>
              <Text style={{ color: ochre, fontSize: 10.5 }}>Email me at</Text>
              <Text style={{ color: ochre, fontSize: 10.5 }}>
                {props.contactEmail}
              </Text>
            </Stack>
          </Stack>

          <View style={{ left: 473, position: "absolute", top: 716 }}>
            <QRCode
              payload={props.payUrl}
              size={60}
              color={navy}
              backgroundColor={cream}
            />
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export const verticalInvoiceExample: VerticalInvoiceProps = {
  invoiceNumber: "01234",
  invoiceDate: "29th January, 2030",
  sellerName: "Margarita Perez",
  billedTo: ["Resse Miller", "hello@reallygreatsite.com"],
  items: [
    { description: "Copywriting for 1 Blog", subtotal: "$100" },
    { description: "10 Social Media Posts", subtotal: "$100" },
    { description: "20 Hours Administration Work", subtotal: "$400" },
  ],
  total: "$600",
  paymentName: "Margarita Perez",
  paymentAccount: "012345678901",
  payUrl: "https://example.com/pay/01234",
  contactEmail: "hello@reallygreatsite.com",
};

export const verticalInvoiceDefinition: TemplateDefinition = {
  id: "invoice-vertical",
  slug: "invoice-vertical",
  title: "Vertical studio invoice",
  family: "invoice",
  familyLabel: "Invoices",
  description:
    "A cream editorial invoice with a vertical identity rail, compact services table and QR payment block.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["invoice", "editorial", "services", "qr-payment"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: true },
  renderSample: () => <VerticalInvoice {...verticalInvoiceExample} />,
};
