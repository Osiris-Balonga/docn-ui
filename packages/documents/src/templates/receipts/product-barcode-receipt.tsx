import { Document, Circle, Svg } from "@react-pdf/renderer";
import { Barcode } from "../../primitives/barcode";
import { ReceiptFrame } from "../../primitives/receipt-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition } from "../types";

export interface ProductBarcodeReceiptProps {
  date: string;
  items: readonly { amount: string; description: string }[];
  style?: TemplateStyleOverrides<typeof productBarcodeReceiptStyle.slots>;
  total: string;
}

export const productBarcodeReceiptStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#2454c6",
      border: "#e5e7eb",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#20242a",
      mutedText: "#8b919b",
    },
    typeScale: { caption: 6.5, body: 8, label: 9, heading: 14, display: 19 },
  },
  { rule: "#edf0f4" },
);

export function ProductBarcodeReceipt(props: ProductBarcodeReceiptProps) {
  const style = resolveTemplateStyle(productBarcodeReceiptStyle, props.style);
  return (
    <Document title="Product receipt" language="en">
      <ReceiptFrame widthMm={80} heightMm={100} theme={style.theme}>
        <Stack gap="lg">
          <Row justify="between" align="center">
            <Row gap="sm" align="center">
              <Svg width={20} height={20}>
                <Circle
                  cx={10}
                  cy={10}
                  r={9}
                  fill={style.theme.colors.accent}
                />
                <Circle cx={10} cy={10} r={4} fill="#ffffff" />
              </Svg>
              <Stack gap="xs">
                <Text weight="strong">LUMA SUPPLY</Text>
                <Text tone="muted" size="caption">
                  Useful tools, thoughtfully made
                </Text>
              </Stack>
            </Row>
            <Text tone="muted" size="caption">
              {props.date}
            </Text>
          </Row>
          <Row
            justify="between"
            style={{
              borderBottomColor: style.slots.rule,
              borderBottomWidth: 0.5,
              paddingBottom: 7,
            }}
          >
            <Text tone="muted" size="caption">
              DESCRIPTION
            </Text>
            <Text tone="muted" size="caption">
              SUBTOTAL
            </Text>
          </Row>
          <Stack gap="md">
            {props.items.map((item) => (
              <Row key={item.description} justify="between">
                <Text style={{ width: "72%" }}>{item.description}</Text>
                <Text>{item.amount}</Text>
              </Row>
            ))}
            <Row justify="between">
              <Text tone="muted">Total</Text>
              <Text weight="strong" style={{ fontSize: 12 }}>
                {props.total}
              </Text>
            </Row>
          </Stack>
          <Stack
            gap="sm"
            style={{
              borderTopColor: style.slots.rule,
              borderTopWidth: 0.5,
              paddingTop: 12,
            }}
          >
            <Barcode
              format="code128"
              value="LUMA-0419-109800"
              width={172}
              barHeight={45}
              showValue={false}
            />
            <Text align="center" tone="muted" size="caption">
              LUMA-0419-109800
            </Text>
          </Stack>
        </Stack>
      </ReceiptFrame>
    </Document>
  );
}

export const productBarcodeReceiptExample: ProductBarcodeReceiptProps = {
  date: "17.04.2026",
  items: [
    { description: "Luma Pocket Reader · 64 GB · clay", amount: "$999.00" },
    { description: "Protective reader case", amount: "$99.00" },
  ],
  total: "$1,098.00",
};

export const productBarcodeReceiptDefinition: TemplateDefinition = {
  id: "receipt-product-barcode",
  slug: "receipt-product-barcode",
  title: "Product barcode receipt",
  family: "receipt",
  familyLabel: "Receipts",
  description:
    "A compact branded product receipt with a date, two line items and a machine-readable barcode.",
  supportedFormatIds: ["receipt-80"],
  supportedThemeIds: ["neutral"],
  tags: ["receipt", "barcode", "product"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => (
    <ProductBarcodeReceipt {...productBarcodeReceiptExample} />
  ),
};
