import { Document, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Heading } from "../../primitives/heading";
import { Link } from "../../primitives/link";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { getPdfTheme, type PdfTheme } from "../../themes/themes";
import type { TemplateDefinition } from "../types";

export interface StripeInvoiceProps {
  amountDue: string;
  customer: readonly string[];
  dueDate: string;
  invoiceNumber: string;
  lines: readonly {
    amount: string;
    description: string;
    quantity: string;
    unitPrice: string;
  }[];
  seller: string;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed") throw new Error("Invoice requires A4.");
const format = resolvedFormat;

const theme: PdfTheme = {
  ...getPdfTheme("neutral"),
  colors: {
    ...getPdfTheme("neutral").colors,
    accent: "#635bff",
    canvas: "#ffffff",
    surface: "#ffffff",
    text: "#111111",
    mutedText: "#5f6368",
  },
  typeScale: { caption: 7, body: 9.5, label: 10.5, heading: 18, display: 25 },
};

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Row
      justify="between"
      style={{
        borderTopColor: "#e5e5e5",
        borderTopWidth: 0.5,
        paddingVertical: 7,
      }}
    >
      <Text weight={strong ? "strong" : "regular"} style={{ fontSize: 9.5 }}>
        {label}
      </Text>
      <Text weight={strong ? "strong" : "regular"} style={{ fontSize: 9.5 }}>
        {value}
      </Text>
    </Row>
  );
}

export function StripeInvoice(props: StripeInvoiceProps) {
  return (
    <Document title={`Invoice ${props.invoiceNumber}`} language="en">
      <PageFrame format={format} theme={theme} backgroundColor="#ffffff">
        <View
          style={{
            position: "absolute",
            left: -28,
            right: -28,
            top: -28,
            borderTopColor: theme.colors.accent,
            borderTopWidth: 3,
          }}
        />
        <Stack
          gap="xl"
          style={{ gap: 29, paddingHorizontal: 20, paddingTop: 12 }}
        >
          <Row justify="between" align="center">
            <Heading level="display" style={{ fontSize: 24 }}>
              Invoice
            </Heading>
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.accent,
                borderRadius: 22,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Text
                weight="strong"
                tone="inverted"
                style={{ fontSize: 26, lineHeight: 1 }}
              >
                S
              </Text>
            </View>
          </Row>

          <Stack gap="xs">
            <Text weight="strong" style={{ fontSize: 9.5 }}>
              Invoice number&nbsp; {props.invoiceNumber}
            </Text>
            <Row gap="xl">
              <Text style={{ width: 72 }}>Date due</Text>
              <Text>{props.dueDate}</Text>
            </Row>
          </Stack>

          <Row justify="between" style={{ paddingTop: 13 }}>
            <Stack gap="xs" style={{ width: "42%" }}>
              <Text weight="strong">{props.seller}</Text>
            </Stack>
            <Stack
              gap="xs"
              style={{ flexDirection: "column", gap: 3, width: "48%" }}
            >
              <Text weight="strong">Bill to</Text>
              {props.customer.map((line) => (
                <Text key={line}>{line}</Text>
              ))}
            </Stack>
          </Row>

          <Stack gap="md" style={{ paddingTop: 6 }}>
            <Heading level={2} style={{ fontSize: 18 }}>
              {`${props.amountDue} due ${props.dueDate}`}
            </Heading>
            <Link href="https://example.com/pay" tone="accent">
              Pay online
            </Link>
            <Text style={{ marginTop: 5 }}>Thanks for your business!</Text>
          </Stack>

          <Stack gap="xs" style={{ paddingTop: 4 }}>
            <Row
              style={{
                borderBottomColor: "#111111",
                borderBottomWidth: 0.75,
                paddingBottom: 6,
              }}
            >
              <Text style={{ width: "50%", fontSize: 7.5 }}>Description</Text>
              <Text style={{ width: "12%", fontSize: 7.5 }}>Qty</Text>
              <Text align="right" style={{ width: "19%", fontSize: 7.5 }}>
                Unit price
              </Text>
              <Text align="right" style={{ width: "19%", fontSize: 7.5 }}>
                Amount
              </Text>
            </Row>
            {props.lines.map((line) => (
              <Row key={line.description} style={{ paddingVertical: 6 }}>
                <Text weight="strong" style={{ width: "50%" }}>
                  {line.description}
                </Text>
                <Text style={{ width: "12%" }}>{line.quantity}</Text>
                <Text align="right" style={{ width: "19%" }}>
                  {line.unitPrice}
                </Text>
                <Text align="right" style={{ width: "19%" }}>
                  {line.amount}
                </Text>
              </Row>
            ))}
            <Row justify="end">
              <Stack gap="xs" style={{ width: "48%" }}>
                <SummaryRow label="Subtotal" value={props.amountDue} />
                <SummaryRow label="Total" value={props.amountDue} />
                <SummaryRow label="Amount due" value={props.amountDue} strong />
              </Stack>
            </Row>
          </Stack>

          <Stack
            gap="sm"
            style={{
              borderTopColor: "#e5e5e5",
              borderTopWidth: 0.5,
              marginTop: 88,
              paddingTop: 18,
            }}
          >
            <Text weight="strong">Pay with ACH or wire transfer</Text>
            <Text style={{ maxWidth: 265 }}>
              A routing number, account number, and SWIFT code will be generated
              for this customer when the invoice is sent.
            </Text>
            <Stack gap="xs">
              <Text>Bank name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; —</Text>
              <Text>Routing number&nbsp; —</Text>
              <Text>Account number&nbsp; —</Text>
              <Text>SWIFT code&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; —</Text>
            </Stack>
            <Text style={{ marginTop: 14 }}>
              {props.invoiceNumber} · {props.amountDue} due {props.dueDate}
            </Text>
          </Stack>
        </Stack>
      </PageFrame>
    </Document>
  );
}

export const stripeInvoiceExample: StripeInvoiceProps = {
  invoiceNumber: "26B34523-DRAFT",
  dueDate: "February 5, 2026",
  seller: "Source Studio",
  customer: ["Jane Diaz", "jane.diaz@example.com"],
  amountDue: "$48.99",
  lines: [
    {
      description: "Design system review",
      quantity: "1",
      unitPrice: "$48.99",
      amount: "$48.99",
    },
  ],
};

export const stripeInvoiceDefinition: TemplateDefinition = {
  id: "invoice-stripe",
  slug: "invoice-stripe",
  title: "Stripe-style invoice",
  family: "invoice",
  familyLabel: "Invoices",
  description:
    "A spacious service invoice with clear due amount, line items and bank instructions.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["invoice", "billing", "stripe-style", "payment"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
  renderSample: () => <StripeInvoice {...stripeInvoiceExample} />,
};
