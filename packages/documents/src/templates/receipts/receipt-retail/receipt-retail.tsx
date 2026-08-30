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
import { receiptRetailMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function ReceiptRetailDocument(props: ReceiptDocumentProps) {
  const labels =
    props.locale === "fr"
      ? { payment: "Paiement", receipt: "Reçu" }
      : { payment: "Payment", receipt: "Receipt" };
  return (
    <Document
      title={`${props.data.number} - retail receipt`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={props.locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <ReceiptPage props={props}>
        <MerchantHeader props={props} />
        <Rule strong />
        <View style={{ flexDirection: "row", fontSize: 6.5 }}>
          <Text style={{ flex: 1 }}>
            {labels.receipt} {props.data.number}
          </Text>
          <Text>
            {formatReceiptInstant(
              props.data.occurredAt,
              props.data.timeZone,
              props.locale,
            )}
          </Text>
        </View>
        <Rule />
        <ReceiptLines props={props} showTax />
        <Rule strong />
        <Totals props={props} />
        <Rule />
        <View style={{ flexDirection: "row" }}>
          <Text style={{ flex: 1 }}>{labels.payment}</Text>
          <Text>{props.data.paymentMethod}</Text>
        </View>
        {props.data.notes ? (
          <Text style={{ marginTop: 10, textAlign: "center" }}>
            {props.data.notes}
          </Text>
        ) : null}
      </ReceiptPage>
    </Document>
  );
}

export function createReceiptRetailPlan(
  input: unknown,
  options?: ReceiptPlanOptions,
) {
  return createReceiptPlan(
    input,
    receiptRetailMetadata,
    (props) => <ReceiptRetailDocument {...props} />,
    options,
  );
}
