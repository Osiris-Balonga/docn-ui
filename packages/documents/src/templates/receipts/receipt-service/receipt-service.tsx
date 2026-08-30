import { Document, Text, View } from "@react-pdf/renderer";
import {
  createReceiptPlan,
  type ReceiptDocumentProps,
  type ReceiptPlanOptions,
} from "../plan";
import {
  formatReceiptInstant,
  MerchantHeader,
  ReceiptLines,
  ReceiptPage,
  Rule,
  Totals,
} from "../layout";
import { receiptServiceMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function ReceiptServiceDocument(props: ReceiptDocumentProps) {
  const customerLabel = props.locale === "fr" ? "CLIENT" : "CUSTOMER";
  return (
    <Document
      title={`${props.data.number} - service receipt`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={props.locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <ReceiptPage props={props}>
        <MerchantHeader align="left" props={props} />
        <View
          style={{ backgroundColor: "#eeeeee", gap: 2, padding: 7 }}
          wrap={false}
        >
          <Text style={{ fontSize: 6, fontWeight: 700 }}>{customerLabel}</Text>
          <Text style={{ fontSize: 9 }}>
            {props.data.customer ?? "Walk-in customer"}
          </Text>
          <Text style={{ color: "#555555", fontSize: 6.5 }}>
            {props.data.number} ·{" "}
            {formatReceiptInstant(
              props.data.occurredAt,
              props.data.timeZone,
              props.locale,
            )}
          </Text>
        </View>
        <Rule strong />
        <ReceiptLines props={props} />
        <Rule strong />
        <Totals props={props} totalStyle={{ fontSize: 11 }} />
        <Text style={{ marginTop: 9 }}>
          Payment: {props.data.paymentMethod}
        </Text>
        {props.data.notes ? (
          <Text style={{ color: "#555555", marginTop: 6 }}>
            {props.data.notes}
          </Text>
        ) : null}
      </ReceiptPage>
    </Document>
  );
}

export function createReceiptServicePlan(
  input: unknown,
  options?: ReceiptPlanOptions,
) {
  return createReceiptPlan(
    input,
    receiptServiceMetadata,
    (props) => <ReceiptServiceDocument {...props} />,
    options,
  );
}
