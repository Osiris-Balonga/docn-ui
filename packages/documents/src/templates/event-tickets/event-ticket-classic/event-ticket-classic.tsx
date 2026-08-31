import { Document, View } from "@react-pdf/renderer";
import { Heading, PageFrame, QRCode, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import { createEventTicketPlan, type EventTicketDocumentProps } from "../plan";
import { formatEventStart } from "../schema";
import { eventTicketClassicMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function EventTicketClassicDocument({
  data,
  format,
  locale,
  overrides,
  printProfile,
  themeId,
}: EventTicketDocumentProps) {
  const theme = getPdfTheme(themeId, overrides.accentColor);
  const start = formatEventStart(data.startsAt, data.timeZone, locale);
  const compact = format.id === "ticket-150x70";
  const qrSize = format.id === "ticket-210x74" ? 112 : 96;
  const labels =
    locale === "fr"
      ? {
          access: "ACCÈS",
          admit: "ENTRÉE",
          category: "Entrée générale",
          date: "DATE / HEURE",
          one: "1",
          seat: "PLACE",
          venue: "LIEU",
        }
      : {
          access: "ACCESS",
          admit: "ADMIT",
          category: "General admission",
          date: "DATE / TIME",
          one: "ONE",
          seat: "SEAT",
          venue: "VENUE",
        };
  return (
    <Document
      title={`${data.eventName} - classic event ticket`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        <View style={{ flexDirection: "row", height: "100%" }} wrap={false}>
          <View
            style={{
              alignItems: "center",
              borderRightColor: theme.colors.border,
              borderRightStyle: "dashed",
              borderRightWidth: 1,
              justifyContent: "space-between",
              paddingRight: 16,
              width: qrSize + 30,
            }}
          >
            <QRCode
              color={theme.colors.text}
              minimumModuleSize={1.25}
              payload={data.qrPayload}
              size={qrSize}
            />
            <View style={{ alignItems: "center", gap: 2 }}>
              <Text size="caption" tone="muted">
                {labels.access}
              </Text>
              <Text size="label">{data.ticketId}</Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              paddingHorizontal: 18,
            }}
          >
            <View style={{ gap: 6 }}>
              <Text size="caption" tone="muted">
                {data.category ?? labels.category}
              </Text>
              <Heading level={compact ? "heading" : "display"}>
                {data.eventName}
              </Heading>
            </View>
            <View
              style={{
                flexDirection: compact ? "column" : "row",
                gap: compact ? 5 : 18,
              }}
            >
              <View style={{ gap: 2 }}>
                <Text size="caption" tone="muted">
                  {labels.date}
                </Text>
                <Text size="label">{`${start.date} - ${start.time}`}</Text>
                <Text size="caption" tone="muted">
                  {start.timeZone}
                </Text>
              </View>
              <View style={{ ...(compact ? {} : { flex: 1 }), gap: 2 }}>
                <Text size="caption" tone="muted">
                  {labels.venue}
                </Text>
                <Text size="label">{data.venue}</Text>
              </View>
              {data.seat ? (
                <View style={{ gap: 2 }}>
                  <Text size="caption" tone="muted">
                    {labels.seat}
                  </Text>
                  <Text size="label">{data.seat}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.accent,
              justifyContent: "space-between",
              paddingVertical: 8,
              width: 28,
            }}
          >
            <Text size="caption" tone="inverted">
              {labels.admit}
            </Text>
            <Text size="caption" tone="inverted">
              {labels.one}
            </Text>
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export function createEventTicketClassicPlan(input: unknown) {
  return createEventTicketPlan(input, eventTicketClassicMetadata, (props) => (
    <EventTicketClassicDocument {...props} />
  ));
}
