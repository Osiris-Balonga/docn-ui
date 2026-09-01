import { Document, View } from "@react-pdf/renderer";
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

export interface CashRegisterReceiptProps {
  items: readonly { label: string; price: string }[];
  style?: TemplateStyleOverrides<typeof cashRegisterReceiptStyle.slots>;
}
export const cashRegisterReceiptStyle = defineTemplateStyle(
  "editorial",
  {
    colors: {
      accent: "#111111",
      border: "#333333",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#111111",
      mutedText: "#333333",
    },
    fonts: {
      body: "Noto Serif",
      heading: "Noto Serif",
      regularWeight: 400,
      strongWeight: 700,
    },
    typeScale: { caption: 7, body: 8.5, label: 9, heading: 14, display: 20 },
  },
  { dash: "#333333" },
);
const Dash = ({ color }: { color: string }) => (
  <View
    style={{
      borderBottomColor: color,
      borderBottomStyle: "dashed",
      borderBottomWidth: 0.8,
      height: 4,
      width: "100%",
    }}
  />
);
export function CashRegisterReceipt(props: CashRegisterReceiptProps) {
  const style = resolveTemplateStyle(cashRegisterReceiptStyle, props.style);
  const total = props.items.reduce((sum, item) => sum + Number(item.price), 0);
  return (
    <Document title="Cash receipt" language="en">
      <ReceiptFrame widthMm={80} heightMm={142} theme={style.theme}>
        <Stack gap="xs">
          <Text align="center" weight="strong" style={{ fontSize: 15 }}>
            CASH RECEIPT
          </Text>
          <Text align="center">Elm Corner Market</Text>
          <Text align="center">1234 Market Lane · Tel: 123-456-7890</Text>
          <Dash color={style.slots.dash} />
          <Row justify="between">
            <Text>Date: 01-09-2026</Text>
            <Text>10:35</Text>
          </Row>
          <Dash color={style.slots.dash} />
          {props.items.map((item) => (
            <Row key={item.label} justify="between">
              <Text>{item.label}</Text>
              <Text>{item.price}</Text>
            </Row>
          ))}
          <Dash color={style.slots.dash} />
          <Row justify="between">
            <Text style={{ fontSize: 14 }}>Total</Text>
            <Text style={{ fontSize: 14 }}>{total.toFixed(2)}</Text>
          </Row>
          <Row justify="between">
            <Text>Sub-total</Text>
            <Text>{(total - 8).toFixed(2)}</Text>
          </Row>
          <Row justify="between">
            <Text>Sales Tax</Text>
            <Text>8.00</Text>
          </Row>
          <Row justify="between">
            <Text>Balance</Text>
            <Text>{total.toFixed(2)}</Text>
          </Row>
          <Text
            align="center"
            weight="strong"
            style={{ fontSize: 17, marginTop: 10 }}
          >
            THANK YOU
          </Text>
          <Row justify="center">
            <Barcode
              format="code128"
              value="ELM-0901-8480"
              width={150}
              barHeight={45}
              showValue={false}
            />
          </Row>
        </Stack>
      </ReceiptFrame>
    </Document>
  );
}
export const cashRegisterReceiptExample: CashRegisterReceiptProps = {
  items: [
    { label: "Stone-ground flour", price: "6.50" },
    { label: "Apricot preserve", price: "7.50" },
    { label: "Olive oil", price: "48.00" },
    { label: "Sea salt", price: "9.30" },
    { label: "Herbal tea", price: "11.90" },
    { label: "Paper bag", price: "1.20" },
    { label: "Discount", price: "0.40" },
  ],
};
export const cashRegisterReceiptDefinition: TemplateDefinition = {
  id: "receipt-cash-register",
  slug: "receipt-cash-register",
  title: "Cash register receipt",
  family: "receipt",
  familyLabel: "Receipts",
  description:
    "A narrow monospaced-style cash receipt with item rows, tax summary and barcode.",
  supportedFormatIds: ["receipt-80"],
  supportedThemeIds: ["editorial"],
  tags: ["receipt", "cash", "thermal", "barcode"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => <CashRegisterReceipt {...cashRegisterReceiptExample} />,
};
