import { Document } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Heading } from "../../primitives/heading";
import { Image } from "../../primitives/image";
import { PageFrame } from "../../primitives/page-frame";
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
  productImageSource: string;
  products: readonly {
    color: string;
    name: string;
    price: string;
    quantity: number;
  }[];
  shippingAddress: string;
  style?: TemplateStyleOverrides<typeof orderConfirmationStyle.slots>;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed")
  throw new Error("Order confirmation requires A4.");
const format = resolvedFormat;

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
    <Stack gap="xs" style={{ width: "25%" }}>
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
      <PageFrame
        format={format}
        theme={theme}
        backgroundColor={theme.colors.canvas}
      >
        <Stack
          gap="lg"
          style={{ gap: 25, paddingHorizontal: 24, paddingTop: 4 }}
        >
          <Image
            alt="Studio North"
            fit="contain"
            height={21}
            resolvedSource={props.logoSource}
            width={21}
          />
          <Stack gap="sm">
            <Heading level={2} style={{ fontSize: 15 }}>
              Your Order Confirmed!
            </Heading>
            <Text>Hello {props.customerName},</Text>
            <Text tone="muted">
              Your order has been confirmed and will be shipping within the next
              two days.
            </Text>
          </Stack>

          <Row
            gap="md"
            style={{
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
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
                  paddingVertical: 16,
                }}
              >
                <Image
                  alt={product.name}
                  fit="cover"
                  height={52}
                  resolvedSource={props.productImageSource}
                  width={58}
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
            <Stack gap="xs" style={{ width: "44%" }}>
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

          <Stack gap="md" style={{ marginTop: 100 }}>
            <Text>
              We’ll send a shipping confirmation email when the items are on
              their way.
            </Text>
            <Stack gap="xs">
              <Text weight="strong">Thank you for shopping with us!</Text>
              <Text>North Team</Text>
            </Stack>
          </Stack>
        </Stack>
        <Row
          justify="between"
          style={{
            borderTopColor: theme.colors.border,
            borderTopWidth: 0.5,
            bottom: 8,
            left: 24,
            paddingTop: 8,
            position: "absolute",
            right: 24,
          }}
        >
          <Text tone="muted" style={{ fontSize: 5.8 }}>
            Need Help? Visit our Help Center
          </Text>
          <Text tone="muted" style={{ fontSize: 5.8 }}>
            © 2026 North
          </Text>
        </Row>
      </PageFrame>
    </Document>
  );
}

export const orderConfirmationExample = (
  productSource: string,
  logoSource: string,
): OrderConfirmationProps => ({
  customerName: "Chris",
  logoSource,
  orderDate: "12 Jan, 2026",
  orderNumber: "NK483820",
  payment: "Card",
  shippingAddress: "48 Alexander Plaza Apt. 109",
  productImageSource: productSource,
  products: [
    {
      name: "Workshop access pass",
      quantity: 1,
      color: "Ink Black",
      price: "$67.50",
    },
    {
      name: "Printed field guide",
      quantity: 1,
      color: "Light Gray",
      price: "$112.00",
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
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["receipt", "order", "confirmation", "commerce"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
  renderSample: ({ productSource, studioLogoSource }: TemplateSampleAssets) => (
    <OrderConfirmation
      {...orderConfirmationExample(productSource, studioLogoSource)}
    />
  ),
};
