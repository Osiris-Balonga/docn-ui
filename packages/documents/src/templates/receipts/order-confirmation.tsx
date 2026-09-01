import { Document } from "@react-pdf/renderer";
import { Heading } from "../../primitives/heading";
import { Image } from "../../primitives/image";
import { ReceiptFrame } from "../../primitives/receipt-frame";
import { Row } from "../../primitives/row";
import { Separator } from "../../primitives/separator";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition, TemplateSampleAssets } from "../types";

export interface OrderConfirmationProps {
  customerName: string;
  logoSource: string;
  orderDate: string;
  orderNumber: string;
  payment: string;
  products: readonly {
    color: string;
    imageSource: string;
    name: string;
    price: string;
    quantity: number;
  }[];
  shippingAddress: string;
  style?: TemplateStyleOverrides<typeof orderConfirmationStyle.slots>;
}

export const orderConfirmationStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#111111",
      border: "#eeeeee",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#111111",
      mutedText: "#777777",
    },
    typeScale: {
      caption: 6.2,
      body: 7.5,
      label: 8.5,
      heading: 15,
      display: 21,
    },
  },
  { discount: "#1f8f55" },
);

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="xs" style={{ width: "48%" }}>
      <Text tone="muted" style={{ fontSize: 5.8 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 6.5 }}>{value}</Text>
    </Stack>
  );
}

export function OrderConfirmation(props: OrderConfirmationProps) {
  const style = resolveTemplateStyle(orderConfirmationStyle, props.style);
  const { theme } = style;
  const subtotal = "$185.50";
  return (
    <Document title={`Order ${props.orderNumber}`} language="en">
      <ReceiptFrame widthMm={80} heightMm={190} theme={theme}>
        <Stack gap="lg" style={{ gap: 15 }}>
          <Row align="center" gap="sm">
            <Image
              alt="North Goods original mark"
              fit="contain"
              height={17}
              resolvedSource={props.logoSource}
              width={17}
            />
            <Stack gap="xs">
              <Text weight="strong" style={{ fontSize: 8 }}>
                NORTH GOODS
              </Text>
              <Text tone="muted" style={{ fontSize: 6 }}>
                Workshop stationery
              </Text>
            </Stack>
          </Row>
          <Stack gap="sm">
            <Heading level={2} style={{ fontSize: 13 }}>
              Your Order Confirmed!
            </Heading>
            <Text>Hello {props.customerName},</Text>
            <Text tone="muted">
              Your order has been confirmed and will be shipping within the next
              two days.
            </Text>
          </Stack>

          <Row
            gap="sm"
            style={{
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 0.5,
              flexWrap: "wrap",
              paddingBottom: 10,
              rowGap: 8,
            }}
          >
            <Meta label="Order Date" value={props.orderDate} />
            <Meta label="Order No" value={props.orderNumber} />
            <Meta label="Payment" value={props.payment} />
            <Meta label="Shipping Address" value={props.shippingAddress} />
          </Row>

          <Stack gap="xs">
            {props.products.map((product) => (
              <Row
                key={product.name}
                align="center"
                style={{
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: 0.5,
                  paddingVertical: 10,
                }}
              >
                <Image
                  alt={product.name}
                  fit="cover"
                  height={36}
                  resolvedSource={product.imageSource}
                  width={40}
                />
                <Stack gap="xs" style={{ flexGrow: 1 }}>
                  <Text weight="strong">{product.name}</Text>
                  <Text tone="muted" style={{ fontSize: 6.2 }}>
                    Quantity: {product.quantity}
                  </Text>
                  <Text tone="muted" style={{ fontSize: 6.2 }}>
                    Color: {product.color}
                  </Text>
                </Stack>
                <Text weight="strong">{product.price}</Text>
              </Row>
            ))}
          </Stack>

          <Row justify="end">
            <Stack gap="xs" style={{ width: "70%" }}>
              <Row justify="between">
                <Text tone="muted">Subtotal</Text>
                <Text>{subtotal}</Text>
              </Row>
              <Row justify="between">
                <Text tone="muted">Shipping Fee</Text>
                <Text>$12.00</Text>
              </Row>
              <Row justify="between">
                <Text tone="muted">Tax Fee</Text>
                <Text>$7.75</Text>
              </Row>
              <Row justify="between">
                <Text tone="muted">Discount</Text>
                <Text style={{ color: style.slots.discount }}>-$2.00</Text>
              </Row>
              <Separator spacing="xs" />
              <Row justify="between">
                <Text weight="strong">Total</Text>
                <Text weight="strong">$203.25</Text>
              </Row>
            </Stack>
          </Row>

          <Stack gap="md" style={{ marginTop: 24 }}>
            <Text>
              We’ll send a shipping confirmation email when the items are on
              their way.
            </Text>
            <Stack gap="xs">
              <Text weight="strong">Thank you for shopping with us!</Text>
              <Text>North Team</Text>
            </Stack>
          </Stack>
          <Row
            justify="between"
            style={{
              borderTopColor: theme.colors.border,
              borderTopWidth: 0.5,
              paddingTop: 8,
            }}
          >
            <Text tone="muted" style={{ fontSize: 5.8 }}>
              Need help? Visit our Help Center
            </Text>
            <Text tone="muted" style={{ fontSize: 5.8 }}>
              © 2026 North
            </Text>
          </Row>
        </Stack>
      </ReceiptFrame>
    </Document>
  );
}

export const orderConfirmationExample = (
  notebookSource: string,
  cardDeckSource: string,
  logoSource: string,
): OrderConfirmationProps => ({
  customerName: "Chris",
  logoSource,
  orderDate: "12 Jan, 2026",
  orderNumber: "NK483820",
  payment: "Card",
  shippingAddress: "48 Alexander Plaza Apt. 109",
  products: [
    {
      name: "Workshop notebook",
      quantity: 1,
      color: "Charcoal",
      price: "$67.50",
      imageSource: notebookSource,
    },
    {
      name: "Planning card deck",
      quantity: 1,
      color: "Light Gray",
      price: "$112.00",
      imageSource: cardDeckSource,
    },
  ],
});

export const orderConfirmationDefinition: TemplateDefinition = {
  id: "receipt-order-confirmation",
  slug: "receipt-order-confirmation",
  title: "Order confirmation",
  family: "receipt",
  familyLabel: "Receipts",
  description:
    "A product order confirmation with metadata, item imagery and a compact payment summary.",
  supportedFormatIds: ["receipt-80"],
  supportedThemeIds: ["neutral"],
  tags: ["receipt", "order", "confirmation", "commerce"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
  renderSample: ({
    productCardDeckSource,
    productNotebookSource,
    studioLogoSource,
  }: TemplateSampleAssets) => (
    <OrderConfirmation
      {...orderConfirmationExample(
        productNotebookSource,
        productCardDeckSource,
        studioLogoSource,
      )}
    />
  ),
};
