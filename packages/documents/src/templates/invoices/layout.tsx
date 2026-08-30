import { Document, Page, Text, View } from "@react-pdf/renderer";
import { calculateMonetaryDocument, formatMinorAmount } from "../../core/money";
import {
  FlowTableCell,
  FlowTableHeader,
  FlowTableRow,
  type FlowTableColumn,
} from "../../primitives/table";
import { getPageGeometry } from "../../render/print-profile";
import { getPdfTheme } from "../../themes/themes";
import type { InvoiceDocumentProps } from "./plan";

export type InvoiceVariant = "business" | "minimal" | "studio";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

function formatDate(value: string, locale: "en" | "fr") {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)));
}

function PartyBlock({
  label,
  party,
  strong,
}: {
  label: string;
  party: InvoiceDocumentProps["data"]["seller"];
  strong?: boolean;
}) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text
        style={{
          color: strong ? "#ffffff" : "#666666",
          fontSize: 6.5,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: 0.5,
          marginBottom: 2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 2,
        }}
      >
        {party.name}
      </Text>
      {party.address.map((line) => (
        <Text key={line} style={{ fontSize: 7 }}>
          {line}
        </Text>
      ))}
      {party.email ? <Text style={{ fontSize: 7 }}>{party.email}</Text> : null}
      {party.phone ? <Text style={{ fontSize: 7 }}>{party.phone}</Text> : null}
      {party.taxIdentifier ? (
        <Text style={{ fontSize: 7 }}>{party.taxIdentifier}</Text>
      ) : null}
    </View>
  );
}

export function InvoiceDocument({
  props,
  variant,
}: {
  props: InvoiceDocumentProps;
  variant: InvoiceVariant;
}) {
  const theme = getPdfTheme(props.themeId, props.overrides.accentColor);
  const totals = calculateMonetaryDocument(props.data.lines);
  const geometry = getPageGeometry(
    props.format.trim.widthPt,
    props.format.trim.heightPt,
    props.printProfile,
  );
  const margin = geometry.trimInset + 38;
  const contentWidth = geometry.mediaWidth - margin * 2;
  const studio = variant === "studio";
  const business = variant === "business";
  const accent = theme.colors.accent;
  const dark = business ? "#171717" : studio ? accent : theme.colors.text;
  const border = business ? "#cfcfcf" : studio ? "#c7c7c7" : "#d8d8d8";
  const mutedSurface = business ? "#f2f2f2" : studio ? "#f4f4f4" : "#ffffff";
  const labels =
    props.locale === "fr"
      ? {
          amount: "Montant",
          billFrom: "Émetteur",
          billTo: "Client",
          description: "Description",
          due: "Échéance",
          invoice: "Facture",
          issue: "Émise le",
          notes: "Notes",
          price: "Prix",
          quantity: "Qté",
          subtotal: "Sous-total",
          tax: "Taxes",
          terms: "Conditions",
          total: "Total",
        }
      : {
          amount: "Amount",
          billFrom: "From",
          billTo: "Bill to",
          description: "Description",
          due: "Due",
          invoice: "Invoice",
          issue: "Issued",
          notes: "Notes",
          price: "Price",
          quantity: "Qty",
          subtotal: "Subtotal",
          tax: "Tax",
          terms: "Terms",
          total: "Total",
        };
  const columns = [
    { key: "description", label: labels.description, width: "46%" },
    { align: "right", key: "quantity", label: labels.quantity, width: "12%" },
    { align: "right", key: "price", label: labels.price, width: "20%" },
    { align: "right", key: "amount", label: labels.amount, width: "22%" },
  ] as const satisfies readonly FlowTableColumn[];

  return (
    <Document
      title={`${props.data.number} - ${variant} invoice`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={props.locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <Page
        size={[geometry.mediaWidth, geometry.mediaHeight]}
        style={{
          backgroundColor: studio ? theme.colors.canvas : "#ffffff",
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
          fontSize: 8,
          lineHeight: 1.35,
          paddingBottom: geometry.trimInset + 50,
          paddingHorizontal: margin,
          paddingTop: geometry.trimInset + 176,
        }}
      >
        <View
          fixed
          style={{
            backgroundColor: studio ? accent : "#ffffff",
            color: studio ? "#ffffff" : theme.colors.text,
            height: 136,
            left: margin,
            padding: studio ? 14 : 0,
            position: "absolute",
            top: geometry.trimInset + 22,
            width: contentWidth,
          }}
        >
          <View style={{ alignItems: "flex-start", flexDirection: "row" }}>
            <View style={{ flex: 1, paddingRight: 20 }}>
              <Text
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: studio ? 19 : 15,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {props.data.seller.name}
              </Text>
              {props.data.project ? (
                <Text style={{ fontSize: 7.5, marginTop: 3 }}>
                  {props.data.project}
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: "flex-end", width: 180 }}>
              <Text
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: studio ? 23 : 20,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: 5,
                  textTransform: "uppercase",
                }}
              >
                {labels.invoice}
              </Text>
              <Text style={{ fontSize: 9, fontWeight: 700 }}>
                {props.data.number}
              </Text>
              <Text style={{ fontSize: 6.5, marginTop: 3 }}>
                {labels.issue}: {formatDate(props.data.issueDate, props.locale)}{" "}
                · {labels.due}: {formatDate(props.data.dueDate, props.locale)}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: studio ? "rgba(255,255,255,0.12)" : mutedSurface,
              borderTopColor: studio ? "rgba(255,255,255,0.25)" : border,
              borderTopWidth: 0.75,
              flexDirection: "row",
              gap: 28,
              marginTop: 12,
              padding: studio ? 9 : 9,
            }}
          >
            <PartyBlock
              label={labels.billFrom}
              party={props.data.seller}
              strong={studio}
            />
            <PartyBlock
              label={labels.billTo}
              party={props.data.customer}
              strong={studio}
            />
          </View>
        </View>

        <FlowTableHeader
          backgroundColor={business || studio ? dark : "#ffffff"}
          borderColor={border}
          columns={columns}
          color={business || studio ? "#ffffff" : theme.colors.text}
          left={margin}
          top={geometry.trimInset + 158}
          width={contentWidth}
        />

        <View
          fixed
          style={{
            bottom: geometry.trimInset + 20,
            flexDirection: "row",
            left: margin,
            position: "absolute",
            width: contentWidth,
          }}
        >
          <Text
            style={{ color: theme.colors.mutedText, flex: 1, fontSize: 6.5 }}
          >
            {props.data.number}
          </Text>
          <Text
            style={{ color: theme.colors.mutedText, fontSize: 6.5 }}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>

        {props.data.lines.map((line, index) => (
          <FlowTableRow key={line.id} borderColor={border}>
            <FlowTableCell width="46%">
              {line.label}
              {line.description ? `\n${line.description}` : ""}
            </FlowTableCell>
            <FlowTableCell align="right" width="12%">
              {line.quantity}
            </FlowTableCell>
            <FlowTableCell align="right" width="20%">
              {formatMinorAmount(
                line.unitPriceMinor,
                props.data.currency,
                props.locale,
              )}
            </FlowTableCell>
            <FlowTableCell align="right" width="22%">
              {formatMinorAmount(
                totals.lines[index]?.totalMinor ?? 0,
                props.data.currency,
                props.locale,
              )}
            </FlowTableCell>
          </FlowTableRow>
        ))}

        <View
          wrap={false}
          style={{
            alignSelf: "flex-end",
            backgroundColor: studio ? accent : mutedSurface,
            color: studio ? "#ffffff" : theme.colors.text,
            gap: 5,
            marginTop: 16,
            padding: 12,
            width: "45%",
          }}
        >
          {[
            [labels.subtotal, totals.subtotalMinor],
            [labels.tax, totals.taxMinor],
          ].map(([label, amount]) => (
            <View key={label} style={{ flexDirection: "row" }}>
              <Text style={{ flex: 1 }}>{label}</Text>
              <Text>
                {formatMinorAmount(
                  amount as number,
                  props.data.currency,
                  props.locale,
                )}
              </Text>
            </View>
          ))}
          <View
            style={{
              borderTopColor: studio ? "#ffffff" : dark,
              borderTopWidth: 1,
              flexDirection: "row",
              paddingTop: 6,
            }}
          >
            <Text style={{ flex: 1, fontSize: 11, fontWeight: 700 }}>
              {labels.total}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 700 }}>
              {formatMinorAmount(
                totals.totalMinor,
                props.data.currency,
                props.locale,
              )}
            </Text>
          </View>
        </View>

        {props.data.notes || props.data.terms ? (
          <View wrap={false} style={{ gap: 10, marginTop: 20 }}>
            {props.data.notes ? (
              <View>
                <Text style={{ fontSize: 8, fontWeight: 700 }}>
                  {labels.notes}
                </Text>
                <Text style={{ color: theme.colors.mutedText, marginTop: 3 }}>
                  {props.data.notes}
                </Text>
              </View>
            ) : null}
            {props.data.terms ? (
              <View>
                <Text style={{ fontSize: 8, fontWeight: 700 }}>
                  {labels.terms}
                </Text>
                <Text style={{ color: theme.colors.mutedText, marginTop: 3 }}>
                  {props.data.terms}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {props.data.legalFields.length > 0 ? (
          <View wrap={false} style={{ gap: 3, marginTop: 18 }}>
            {props.data.legalFields.map((field) => (
              <Text
                key={field.label}
                style={{ color: theme.colors.mutedText, fontSize: 6.5 }}
              >
                {field.label}: {field.value}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
