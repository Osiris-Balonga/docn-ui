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
import { getPdfTheme } from "../../../themes/themes";
import { receiptServiceMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function ReceiptServiceDocument(props: ReceiptDocumentProps) {
  const customerLabel = props.locale === "fr" ? "CLIENT" : "CUSTOMER";
  const paidLabel = props.locale === "fr" ? "PAYÉ" : "PAID";
  const paymentLabel =
    props.locale === "fr" ? "Moyen de paiement" : "Payment method";
  const theme = getPdfTheme(props.themeId, props.overrides.accentColor);
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
          style={{
            alignItems: "center",
            borderTopColor: theme.colors.border,
            borderTopWidth: 0.75,
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
            paddingTop: 7,
          }}
          wrap={false}
        >
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 7, fontWeight: 700 }}>
              {props.data.number}
            </Text>
            <Text style={{ color: theme.colors.mutedText, fontSize: 6 }}>
              {formatReceiptInstant(
                props.data.occurredAt,
                props.data.timeZone,
                props.locale,
              )}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.accent,
              paddingHorizontal: 7,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: theme.colors.invertedText, fontSize: 6.5 }}>
              {paidLabel}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.canvas,
            borderLeftColor: theme.colors.accent,
            borderLeftWidth: 2,
            gap: 2,
            padding: 7,
          }}
          wrap={false}
        >
          <Text style={{ fontSize: 6, fontWeight: 700 }}>{customerLabel}</Text>
          <Text style={{ fontSize: 9 }}>
            {props.data.customer ?? "Walk-in customer"}
          </Text>
        </View>
        <Rule strong />
        <ReceiptLines props={props} />
        <Rule strong />
        <Totals props={props} totalStyle={{ fontSize: 11 }} />
        <View
          style={{
            backgroundColor: theme.colors.canvas,
            flexDirection: "row",
            marginTop: 9,
            padding: 7,
          }}
          wrap={false}
        >
          <Text style={{ color: theme.colors.mutedText, flex: 1 }}>
            {paymentLabel}
          </Text>
          <Text style={{ fontWeight: 700 }}>{props.data.paymentMethod}</Text>
        </View>
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
