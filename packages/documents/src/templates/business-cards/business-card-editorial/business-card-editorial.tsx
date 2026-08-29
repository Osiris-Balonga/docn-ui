import { Document, View } from "@react-pdf/renderer";
import { Heading, PageFrame, Separator, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import {
  createBusinessCardPlan,
  type BusinessCardDocumentProps,
} from "../plan";
import { businessCardEditorialMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function BusinessCardEditorialDocument({
  data,
  format,
  locale,
  overrides,
  printProfile,
  themeId,
}: BusinessCardDocumentProps) {
  const theme = getPdfTheme(themeId, overrides.accentColor);
  return (
    <Document
      title={`${data.name} — editorial business card`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-US"}
    >
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        <View style={{ flexDirection: "row", height: "100%" }} wrap={false}>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              paddingRight: 14,
            }}
          >
            <Text size="caption" tone="muted">
              {data.organization ?? "Independent practice"}
            </Text>
            <View>
              <Heading level="display">{data.name}</Heading>
              {data.role ? <Text>{data.role}</Text> : null}
            </View>
          </View>
          <View
            style={{
              borderLeftColor: theme.colors.accent,
              borderLeftWidth: 2,
              justifyContent: "flex-end",
              paddingLeft: 12,
              width: 72,
            }}
          >
            <Text size="caption" tone="muted">
              Vol. 01
            </Text>
            <Heading>{new Date(fixedDate).getUTCFullYear().toString()}</Heading>
          </View>
        </View>
      </PageFrame>
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        <View
          style={{ height: "100%", justifyContent: "space-between" }}
          wrap={false}
        >
          <View>
            <Heading>{data.organization ?? data.name}</Heading>
            <Separator spacing="xs" />
          </View>
          <View style={{ gap: 5 }}>
            {data.email ? <Text size="label">{data.email}</Text> : null}
            {data.phone ? <Text size="label">{data.phone}</Text> : null}
            {data.website ? (
              <Text size="label">
                {data.website.replace(/^https?:\/\//, "")}
              </Text>
            ) : null}
            {data.address ? <Text size="label">{data.address}</Text> : null}
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export function createBusinessCardEditorialPlan(input: unknown) {
  return createBusinessCardPlan(
    input,
    businessCardEditorialMetadata,
    (props) => <BusinessCardEditorialDocument {...props} />,
  );
}
