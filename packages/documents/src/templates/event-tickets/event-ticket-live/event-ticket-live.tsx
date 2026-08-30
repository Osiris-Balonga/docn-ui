import { Document, View } from "@react-pdf/renderer";
import { Heading, PageFrame, QRCode, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import { createEventTicketPlan, type EventTicketDocumentProps } from "../plan";
import { formatEventStart } from "../schema";
import { eventTicketLiveMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function EventTicketLiveDocument({
  data,
  format,
  locale,
  overrides,
  printProfile,
  themeId,
}: EventTicketDocumentProps) {
  const theme = getPdfTheme(themeId, overrides.accentColor);
  const start = formatEventStart(data.startsAt, data.timeZone, locale);
  return (
    <Document
      title={`${data.eventName} - live event ticket`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <PageFrame
        backgroundColor={theme.colors.accent}
        format={format}
        printProfile={printProfile}
        theme={theme}
      >
        <View style={{ flexDirection: "row", height: "100%" }} wrap={false}>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              paddingRight: 18,
            }}
          >
            <View style={{ gap: 8 }}>
              <Text size="caption" tone="inverted">
                {`LIVE / ${data.category ?? "ADMISSION"}`}
              </Text>
              <Heading level="display" tone="inverted">
                {data.eventName}
              </Heading>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ gap: 2 }}>
                <Text size="caption" tone="inverted">
                  DATE
                </Text>
                <Heading tone="inverted">{start.date}</Heading>
                <Text tone="inverted">{`${start.time} - ${start.timeZone}`}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 2, maxWidth: 150 }}>
                <Text size="caption" tone="inverted">
                  VENUE
                </Text>
                <Text size="label" tone="inverted">
                  {data.venue}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.surface,
              justifyContent: "space-between",
              padding: 11,
              width: 126,
            }}
          >
            <QRCode
              color={theme.colors.text}
              minimumModuleSize={1.25}
              payload={data.qrPayload}
              size={98}
            />
            <View style={{ alignItems: "center", gap: 2 }}>
              <Text size="caption" tone="muted">
                ACCESS
              </Text>
              <Text size="label">{data.ticketId}</Text>
              {data.attendeeName ? (
                <Text size="caption">{data.attendeeName}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export function createEventTicketLivePlan(input: unknown) {
  return createEventTicketPlan(input, eventTicketLiveMetadata, (props) => (
    <EventTicketLiveDocument {...props} />
  ));
}
