import { Document, Path, Svg, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Heading } from "../../primitives/heading";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition } from "../types";

export interface CorporateInvoiceProps {
  accountNumber: string;
  bankName: string;
  billedTo: readonly string[];
  companyEmail: string;
  companyName: string;
  companyTagline: string;
  companyUrl: string;
  date: string;
  dueDate: string;
  invoiceNumber: string;
  items: readonly {
    description: string;
    price: string;
    quantity: string;
    total: string;
  }[];
  subtotal: string;
  style?: TemplateStyleOverrides<typeof corporateInvoiceStyle.slots>;
  tax: string;
  total: string;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed") throw new Error("Invoice requires A4.");
const format = resolvedFormat;

export const corporateInvoiceStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#243542",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#151515",
      mutedText: "#4a4a4a",
    },
    typeScale: { caption: 7, body: 9, label: 10, heading: 16, display: 28 },
  },
  { signatureFont: "Noto Serif", tableStripe: "#f0f2f3" },
);

const pageInset = -28.35;

function GlobexMark({ invertedText }: { invertedText: string }) {
  return (
    <Svg width={46} height={39} viewBox="0 0 46 39">
      <Path
        d="M3 5 L18 1 L18 30 L3 34 Z M23 3 L42 0 L42 27 L23 34 Z M18 9 L23 7"
        fill="none"
        stroke={invertedText}
        strokeWidth={2.6}
      />
    </Svg>
  );
}

function TableCell({
  children,
  align = "left",
  width,
  strong = false,
  inverted = false,
}: {
  align?: "left" | "right" | "center";
  children: string;
  strong?: boolean;
  inverted?: boolean;
  width: string;
}) {
  return (
    <Text
      align={align}
      tone={inverted ? "inverted" : "default"}
      weight={strong ? "strong" : "regular"}
      style={{ fontSize: 8.7, width }}
    >
      {children}
    </Text>
  );
}

export function CorporateInvoice(props: CorporateInvoiceProps) {
  const style = resolveTemplateStyle(corporateInvoiceStyle, props.style);
  const { theme } = style;
  const ink = theme.colors.accent;
  const stripe = style.slots.tableStripe;
  return (
    <Document title={`Invoice ${props.invoiceNumber}`} language="en">
      <PageFrame
        format={format}
        theme={theme}
        backgroundColor={theme.colors.canvas}
      >
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
              backgroundColor: ink,
              height: 190,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          />

          <Stack gap="xs" style={{ left: 42, position: "absolute", top: 37 }}>
            <GlobexMark invertedText={theme.colors.invertedText} />
            <Heading
              tone="inverted"
              level={2}
              style={{ fontSize: 20, marginTop: 4 }}
            >
              {props.companyName}
            </Heading>
            <Text tone="inverted" style={{ fontSize: 9.5, letterSpacing: 0.3 }}>
              {props.companyTagline}
            </Text>
          </Stack>

          <Stack
            align="end"
            gap="xs"
            style={{ position: "absolute", right: 42, top: 39, width: 160 }}
          >
            <Heading tone="inverted" level="display" style={{ fontSize: 29 }}>
              INVOICE
            </Heading>
            <Stack gap="xs" style={{ marginTop: 20, width: 128 }}>
              <Row justify="between">
                <Text tone="inverted" weight="strong" style={{ fontSize: 7.5 }}>
                  INVOICE NO :
                </Text>
                <Text tone="inverted" style={{ fontSize: 7.5 }}>
                  {props.invoiceNumber}
                </Text>
              </Row>
              <Row justify="between">
                <Text tone="inverted" weight="strong" style={{ fontSize: 7.5 }}>
                  DATE
                </Text>
                <Text tone="inverted" style={{ fontSize: 7.5 }}>
                  : {props.date}
                </Text>
              </Row>
            </Stack>
          </Stack>

          <Stack
            gap="xs"
            style={{ left: 42, position: "absolute", top: 211, width: 210 }}
          >
            <Text weight="strong" style={{ fontSize: 11 }}>
              Invoice To
            </Text>
            {props.billedTo.map((line, index) => (
              <Text
                key={line}
                weight={index === 0 ? "strong" : "regular"}
                style={{ fontSize: 8.3 }}
              >
                {line}
              </Text>
            ))}
          </Stack>

          <Stack
            align="end"
            gap="xs"
            style={{ position: "absolute", right: 42, top: 211, width: 230 }}
          >
            <Row justify="end" style={{ width: "100%" }}>
              <Text
                align="right"
                weight="strong"
                style={{ fontSize: 8.3, width: "65%" }}
              >
                DUE DATE :
              </Text>
              <Text align="right" style={{ fontSize: 8.3, width: "35%" }}>
                {props.dueDate}
              </Text>
            </Row>
            <Row justify="end" style={{ width: "100%" }}>
              <Text
                align="right"
                weight="strong"
                style={{ fontSize: 8.3, width: "65%" }}
              >
                TOTAL DUE :
              </Text>
              <Text align="right" style={{ fontSize: 8.3, width: "35%" }}>
                {props.total}
              </Text>
            </Row>
            <Text align="right" style={{ fontSize: 8.3 }}>
              123 Wrangler Ave, Clayton, NY 11357
            </Text>
            <Text align="right" style={{ fontSize: 8.3 }}>
              +81 999 888 6667
            </Text>
            <Text align="right" style={{ fontSize: 8.3 }}>
              {props.companyEmail}
            </Text>
          </Stack>

          <View style={{ left: 42, position: "absolute", right: 42, top: 309 }}>
            <Row
              align="center"
              style={{
                backgroundColor: ink,
                height: 31,
                paddingHorizontal: 10,
              }}
            >
              <TableCell width="40%" strong inverted>
                Descriptions
              </TableCell>
              <TableCell width="20%" strong inverted>
                Price
              </TableCell>
              <TableCell width="20%" align="center" strong inverted>
                Quantity
              </TableCell>
              <TableCell width="20%" align="right" strong inverted>
                Total
              </TableCell>
            </Row>
            {props.items.map((item, index) => (
              <Row
                key={item.description}
                align="center"
                style={{
                  backgroundColor:
                    index % 2 === 0 ? stripe : theme.colors.surface,
                  height: 36,
                  paddingHorizontal: 10,
                }}
              >
                <TableCell width="40%">{item.description}</TableCell>
                <TableCell width="20%">{item.price}</TableCell>
                <TableCell width="20%" align="center">
                  {item.quantity}
                </TableCell>
                <TableCell width="20%" align="right">
                  {item.total}
                </TableCell>
              </Row>
            ))}
          </View>

          <Stack
            gap="md"
            style={{ left: 42, position: "absolute", top: 569, width: 250 }}
          >
            <Stack gap="xs">
              <Text weight="strong" style={{ fontSize: 11 }}>
                Payment Method
              </Text>
              <Text style={{ fontSize: 8.5 }}>{props.bankName}</Text>
              <Text style={{ fontSize: 8.5 }}>
                A/c no: {props.accountNumber}
              </Text>
              <Text style={{ fontSize: 8.5 }}>
                <Text weight="strong">Card Payment: </Text>Visa, Master Card
              </Text>
            </Stack>
            <Stack gap="xs" style={{ marginTop: 16 }}>
              <Text weight="strong" style={{ fontSize: 11 }}>
                Terms
              </Text>
              <Text style={{ fontSize: 7.4, lineHeight: 1.45 }}>
                Payment is due by the date shown above. Please include the
                invoice number with your transfer.
              </Text>
            </Stack>
          </Stack>

          <Stack
            gap="xs"
            style={{ position: "absolute", right: 42, top: 525, width: 178 }}
          >
            <Row
              justify="between"
              style={{ paddingHorizontal: 9, paddingVertical: 9 }}
            >
              <Text weight="strong" style={{ fontSize: 8.5 }}>
                SUB TOTAL
              </Text>
              <Text style={{ fontSize: 8.5 }}>{props.subtotal}</Text>
            </Row>
            <Row
              justify="between"
              style={{
                backgroundColor: stripe,
                paddingHorizontal: 9,
                paddingVertical: 10,
              }}
            >
              <Text weight="strong" style={{ fontSize: 8.5 }}>
                TAX 10%
              </Text>
              <Text style={{ fontSize: 8.5 }}>{props.tax}</Text>
            </Row>
            <Row
              justify="between"
              style={{
                borderBottomColor: ink,
                borderBottomWidth: 0.7,
                paddingHorizontal: 9,
                paddingVertical: 10,
              }}
            >
              <Text weight="strong" style={{ fontSize: 8.5 }}>
                GRAND TOTAL
              </Text>
              <Text style={{ fontSize: 8.5 }}>{props.total}</Text>
            </Row>
            <Stack align="end" gap="xs" style={{ marginTop: 24 }}>
              <Text
                style={{ fontFamily: style.slots.signatureFont, fontSize: 14 }}
              >
                Anderson
              </Text>
              <Text style={{ fontSize: 7.5 }}>Authorized Signature</Text>
            </Stack>
          </Stack>

          <Text
            weight="strong"
            style={{
              bottom: 40,
              fontSize: 9,
              left: 42,
              letterSpacing: 0.5,
              position: "absolute",
            }}
          >
            THANK YOU FOR YOUR BUSINESS
          </Text>
          <View
            style={{
              backgroundColor: stripe,
              bottom: 0,
              height: 23,
              left: 0,
              position: "absolute",
              right: 0,
            }}
          >
            <Text align="center" style={{ fontSize: 8.5, marginTop: 7 }}>
              {props.companyUrl}
            </Text>
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export const corporateInvoiceExample: CorporateInvoiceProps = {
  companyName: "GLOBEX",
  companyTagline: "IDEA FOR INVOICE",
  invoiceNumber: "#123456",
  date: "01/01/2020",
  dueDate: "01/01/2021",
  billedTo: [
    "Mr. WILLIAM",
    "123 East Street, Richmond,",
    "New York, 22601",
    "dominicwilliams@gmail.com",
  ],
  companyEmail: "globex@gmail.com",
  items: [
    {
      description: "Web Designs",
      price: "$ 100",
      quantity: "01",
      total: "$ 100",
    },
    {
      description: "Logo Designs",
      price: "$ 100",
      quantity: "02",
      total: "$ 200",
    },
    {
      description: "Flyer Designs",
      price: "$ 100",
      quantity: "04",
      total: "$ 400",
    },
    {
      description: "Graphic Designs",
      price: "$ 100",
      quantity: "03",
      total: "$ 300",
    },
    {
      description: "Stationary Designs",
      price: "$ 100",
      quantity: "02",
      total: "$ 200",
    },
  ],
  bankName: "Bank Name",
  accountNumber: "0000000000",
  subtotal: "$ 1200",
  tax: "$ 120",
  total: "$ 1320",
  companyUrl: "www.globex.com",
};

export const corporateInvoiceDefinition: TemplateDefinition = {
  id: "invoice-corporate",
  slug: "invoice-corporate",
  title: "Corporate table invoice",
  family: "invoice",
  familyLabel: "Invoices",
  description:
    "A formal corporate invoice with a dark identity header, striped item table and signed totals block.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["invoice", "corporate", "table", "services"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: true, printProfiles: false, qr: false },
  renderSample: () => <CorporateInvoice {...corporateInvoiceExample} />,
};
