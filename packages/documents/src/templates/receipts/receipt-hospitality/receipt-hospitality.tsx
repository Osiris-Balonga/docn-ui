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
import { receiptHospitalityMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function ReceiptHospitalityDocument(props: ReceiptDocumentProps) {
  return (
    <Document
      title={`${props.data.number} - hospitality receipt`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={props.locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <ReceiptPage props={props}>
        <MerchantHeader props={props} />
        <View style={{ alignItems: "center", gap: 2 }}>
          <Text style={{ fontSize: 9, fontWeight: 700 }}>
            {props.data.table ?? "Guest receipt"}
          </Text>
          {props.data.order ? <Text>{props.data.order}</Text> : null}
          <Text style={{ color: "#555555", fontSize: 6.5 }}>
            {formatReceiptInstant(
              props.data.occurredAt,
              props.data.timeZone,
              props.locale,
            )}
          </Text>
        </View>
        <Rule strong />
        <ReceiptLines props={props} />
        <Rule />
        <Totals props={props} />
        <View
          style={{
            borderColor: "#222222",
            borderWidth: 0.75,
            marginTop: 10,
            padding: 7,
          }}
          wrap={false}
        >
          <Text style={{ fontWeight: 700 }}>{props.data.paymentMethod}</Text>
          {props.data.notes ? (
            <Text style={{ marginTop: 4 }}>{props.data.notes}</Text>
          ) : null}
        </View>
      </ReceiptPage>
    </Document>
  );
}

export function createReceiptHospitalityPlan(
  input: unknown,
  options?: ReceiptPlanOptions,
) {
  return createReceiptPlan(
    input,
    receiptHospitalityMetadata,
    (props) => <ReceiptHospitalityDocument {...props} />,
    options,
  );
}
