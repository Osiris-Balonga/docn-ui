import { Image, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { calculateMonetaryDocument, formatMinorAmount } from "../../core/money";
import { millimetersToPoints } from "../../core/units";
import { getPdfTheme } from "../../themes/themes";
import type { ReceiptDocumentProps } from "./plan";

export function formatReceiptInstant(
  instant: string,
  timeZone: string,
  locale: "en" | "fr",
) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(instant));
}

export function ReceiptPage({
  children,
  props,
}: {
  children: ReactNode;
  props: ReceiptDocumentProps;
}) {
  const sourceTheme = getPdfTheme(props.themeId, props.overrides.accentColor);
  const padding = millimetersToPoints(props.format.safeAreaMm);
  return (
    <Page
      size={[props.format.widthPt, props.heightPt]}
      style={{
        backgroundColor: "#ffffff",
        color: "#111111",
        fontFamily: sourceTheme.fonts.body,
        fontSize: props.format.widthMm === 58 ? 7.5 : 8,
        lineHeight: 1.35,
        padding,
      }}
    >
      {children}
      <Text
        style={{
          color: "#555555",
          fontSize: 5.5,
          marginTop: 9,
          textAlign: "center",
        }}
      >
        {props.finalMarker}
      </Text>
    </Page>
  );
}

export function MerchantHeader({
  align = "center",
  props,
}: {
  align?: "center" | "left";
  props: ReceiptDocumentProps;
}) {
  return (
    <View
      style={{
        alignItems: align === "left" ? "flex-start" : "center",
        gap: 2,
        marginBottom: 10,
      }}
    >
      {props.logoSource ? (
        <Image
          aria-label="Merchant logo"
          src={{ uri: props.logoSource }}
          style={{
            height: 22,
            marginBottom: 4,
            objectFit: "contain",
            width: 56,
          }}
        />
      ) : null}
      <Text style={{ fontSize: 12, fontWeight: 700 }}>
        {props.data.merchant.name}
      </Text>
      {props.data.merchant.address ? (
        <Text style={{ color: "#555555", fontSize: 6.5 }}>
          {props.data.merchant.address}
        </Text>
      ) : null}
      {props.data.merchant.contact ? (
        <Text style={{ color: "#555555", fontSize: 6.5 }}>
          {props.data.merchant.contact}
        </Text>
      ) : null}
    </View>
  );
}

export function Rule({ strong = false }: { strong?: boolean }) {
  return (
    <View
      style={{
        borderBottomColor: "#222222",
        borderBottomStyle: strong ? "solid" : "dashed",
        borderBottomWidth: strong ? 1 : 0.5,
        marginVertical: 6,
      }}
    />
  );
}

export function ReceiptLines({
  props,
  showTax = false,
}: {
  props: ReceiptDocumentProps;
  showTax?: boolean;
}) {
  const totals = calculateMonetaryDocument(props.data.lines);
  return (
    <View>
      {props.data.lines.map((line, index) => (
        <View
          key={line.id}
          style={{ flexDirection: "row", gap: 4, paddingVertical: 3 }}
          wrap={false}
        >
          <Text style={{ width: 19 }}>{line.quantity}×</Text>
          <View style={{ flex: 1 }}>
            <Text>{line.label}</Text>
            {showTax && line.taxRateBasisPoints > 0 ? (
              <Text style={{ color: "#555555", fontSize: 6 }}>
                Tax {(line.taxRateBasisPoints / 100).toFixed(2)}%
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              textAlign: "right",
              width: props.format.widthMm === 58 ? 52 : 66,
            }}
          >
            {formatMinorAmount(
              totals.lines[index]?.subtotalMinor ?? 0,
              props.data.currency,
              props.locale,
            )}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function Totals({
  props,
  totalStyle,
}: {
  props: ReceiptDocumentProps;
  totalStyle?: { fontSize?: number };
}) {
  const totals = calculateMonetaryDocument(props.data.lines);
  const labels =
    props.locale === "fr"
      ? { subtotal: "Sous-total", tax: "Taxes", total: "TOTAL" }
      : { subtotal: "Subtotal", tax: "Tax", total: "TOTAL" };
  const rows = [
    [labels.subtotal, totals.subtotalMinor],
    [labels.tax, totals.taxMinor],
  ] as const;
  return (
    <View style={{ gap: 3 }} wrap={false}>
      {rows.map(([label, value]) => (
        <View key={label} style={{ flexDirection: "row" }}>
          <Text style={{ flex: 1 }}>{label}</Text>
          <Text>
            {formatMinorAmount(value, props.data.currency, props.locale)}
          </Text>
        </View>
      ))}
      <View style={{ flexDirection: "row", marginTop: 3 }}>
        <Text style={[{ flex: 1, fontSize: 10, fontWeight: 700 }, totalStyle]}>
          {labels.total}
        </Text>
        <Text style={[{ fontSize: 10, fontWeight: 700 }, totalStyle]}>
          {formatMinorAmount(
            totals.totalMinor,
            props.data.currency,
            props.locale,
          )}
        </Text>
      </View>
    </View>
  );
}
