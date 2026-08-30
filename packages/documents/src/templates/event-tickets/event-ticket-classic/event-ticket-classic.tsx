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
  const qrSize = format.id === "ticket-210x74" ? 112 : 96;
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
              flex: 1,
              justifyContent: "space-between",
              paddingRight: 18,
            }}
          >
            <View style={{ gap: 6 }}>
              <Text size="caption" tone="muted">
                {data.category ?? "General admission"}
              </Text>
              <Heading level="display">{data.eventName}</Heading>
            </View>
            <View style={{ flexDirection: "row", gap: 18 }}>
              <View style={{ gap: 2 }}>
                <Text size="caption" tone="muted">
                  DATE / TIME
                </Text>
                <Text size="label">{`${start.date} - ${start.time}`}</Text>
                <Text size="caption" tone="muted">
                  {start.timeZone}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text size="caption" tone="muted">
                  VENUE
                </Text>
                <Text size="label">{data.venue}</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              borderLeftColor: theme.colors.border,
              borderLeftStyle: "dashed",
              borderLeftWidth: 1,
              justifyContent: "space-between",
              paddingLeft: 18,
              width: qrSize + 58,
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
                TICKET
              </Text>
              <Text size="label">{data.ticketId}</Text>
              {data.seat ? (
                <Text size="caption">{`Seat ${data.seat}`}</Text>
              ) : null}
            </View>
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
