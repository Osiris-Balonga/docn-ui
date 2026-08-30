import { Document, View } from "@react-pdf/renderer";
import { Heading, PageFrame, QRCode, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import { createEventTicketPlan, type EventTicketDocumentProps } from "../plan";
import { formatEventStart } from "../schema";
import { eventTicketConferenceMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

function PortraitConference({
  data,
  locale,
  theme,
}: Pick<EventTicketDocumentProps, "data" | "locale"> & {
  theme: ReturnType<typeof getPdfTheme>;
}) {
  const start = formatEventStart(data.startsAt, data.timeZone, locale);
  return (
    <View style={{ height: "100%", justifyContent: "space-between" }}>
      <View style={{ gap: 9 }}>
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: theme.colors.accent,
            paddingHorizontal: 9,
            paddingVertical: 5,
          }}
        >
          <Text size="caption" tone="inverted">
            {data.category ?? "Attendee"}
          </Text>
        </View>
        <Heading level="display">{data.eventName}</Heading>
        <Text tone="muted">{`${start.date} - ${start.time} - ${data.venue}`}</Text>
      </View>
      <View style={{ gap: 5 }}>
        <Text size="caption" tone="muted">
          ATTENDEE
        </Text>
        <Heading>{data.attendeeName ?? "Guest"}</Heading>
        {data.seat ? <Text>{data.seat}</Text> : null}
      </View>
      <View
        style={{
          alignItems: "flex-end",
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: 12,
        }}
      >
        <View style={{ gap: 3, width: 120 }}>
          <Text size="caption" tone="muted">
            PASS ID
          </Text>
          <Text size="label">{data.ticketId}</Text>
          <Text size="caption" tone="muted">
            {start.timeZone}
          </Text>
        </View>
        <QRCode
          color={theme.colors.text}
          minimumModuleSize={1.25}
          payload={data.qrPayload}
          size={104}
        />
      </View>
    </View>
  );
}

function LandscapeConference({
  data,
  locale,
  theme,
}: Pick<EventTicketDocumentProps, "data" | "locale"> & {
  theme: ReturnType<typeof getPdfTheme>;
}) {
  const start = formatEventStart(data.startsAt, data.timeZone, locale);
  return (
    <View style={{ flexDirection: "row", height: "100%" }}>
      <View
        style={{ flex: 1, justifyContent: "space-between", paddingRight: 16 }}
      >
        <View style={{ gap: 5 }}>
          <Text
            size="caption"
            tone="muted"
          >{`${start.date} - ${start.time}`}</Text>
          <Heading>{data.eventName}</Heading>
          <Text tone="muted">{data.venue}</Text>
        </View>
        <View style={{ gap: 3 }}>
          <Text size="caption" tone="muted">
            ATTENDEE
          </Text>
          <Heading>{data.attendeeName ?? "Guest"}</Heading>
          <Text size="caption">{`${data.category ?? "Attendee"}${data.seat ? ` - ${data.seat}` : ""}`}</Text>
        </View>
      </View>
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.colors.surface,
          justifyContent: "space-between",
          padding: 10,
          width: 118,
        }}
      >
        <QRCode
          color={theme.colors.text}
          minimumModuleSize={1.25}
          payload={data.qrPayload}
          size={92}
        />
        <Text size="caption">{data.ticketId}</Text>
      </View>
    </View>
  );
}

export function EventTicketConferenceDocument(props: EventTicketDocumentProps) {
  const { data, format, locale, overrides, printProfile, themeId } = props;
  const theme = getPdfTheme(themeId, overrides.accentColor);
  const portrait = format.id === "ticket-a6";
  return (
    <Document
      title={`${data.eventName} - conference event ticket`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-GB"}
    >
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        {portrait ? (
          <PortraitConference data={data} locale={locale} theme={theme} />
        ) : (
          <LandscapeConference data={data} locale={locale} theme={theme} />
        )}
      </PageFrame>
    </Document>
  );
}

export function createEventTicketConferencePlan(input: unknown) {
  return createEventTicketPlan(
    input,
    eventTicketConferenceMetadata,
    (props) => <EventTicketConferenceDocument {...props} />,
  );
}
